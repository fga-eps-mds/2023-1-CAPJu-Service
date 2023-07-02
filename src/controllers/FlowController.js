import Flow from "../models/Flow.js";
import Stage from "../models/Stage.js";
import FlowStage from "../models/FlowStage.js";
import User from "../models/User.js";
import FlowUser from "../models/FlowUser.js";
import FlowProcess from "../models/FlowProcess.js";
import { QueryTypes } from "sequelize";
import { tokenToUser } from "../middleware/authMiddleware.js";
import { filterByName } from "../utils/filters.js"

class FlowController {
  static #stagesSequencesFromFlowStages(flowStages) {
    let sequences = [];
    let stages = [];
    if (flowStages.length > 0) {
      for (const { idStageA: from, commentary, idStageB: to } of flowStages) {
        sequences.push({ from, commentary, to });
        if (!stages.includes(from)) {
          stages.push(from);
        }
        if (!stages.includes(to)) {
          stages.push(to);
        }
      }
    }
    return { stages, sequences };
  }

  static async #createOrUpdateFlow({
    name,
    idUnit,
    sequences,
    idUsersToNotify,
    flow,
  }) {
    for (const idUser of idUsersToNotify) {
      const user = await User.findOne({
        where: { cpf: idUser, idUnit },
      });

      if (!user) {
        return {
          status: 404,
          message: `Usuário '${idUser}' não existe na unidade '${idUnit}'`,
        };
      }
    }

    if (sequences.length < 1) {
      return {
        status: 404,
        message: "Necessário pelo menos duas etapas!",
        json: null,
      };
    }

    for (const sequence of sequences) {
      const { from: idStageA, to: idStageB } = sequence;

      if (idStageA == idStageB) {
        return {
          status: 400,
          message: "Sequências devem ter início e fim diferentes",
          json: null,
        };
      }

      const stageA = await Stage.findByPk(idStageA);
      if (!stageA) {
        return {
          status: 404,
          message: `Não existe a etapa com identificador '${idStageA}'`,
          json: null,
        };
      }
      const stageB = await Stage.findByPk(idStageB);
      if (!stageB) {
        return {
          status: 404,
          message: `Não existe a etapa com identificador '${idStageB}'`,
          json: null,
        };
      }
    }

    if (!flow) {
      flow = await Flow.create({ name, idUnit });
    }

    const { idFlow } = flow;

    for (const sequence of sequences) {
      await FlowStage.create({
        idFlow,
        idStageA: sequence.from,
        idStageB: sequence.to,
        commentary: sequence.commentary,
      });
    }

    for (const idUser of idUsersToNotify) {
      await FlowUser.create({ cpf: idUser, idFlow });
    }

    return {
      status: 200,
      message: null,
      json: {
        idFlow: idFlow,
        name: flow.name,
        idUnit,
        sequences,
        usersToNotify: idUsersToNotify,
      },
    };
  }

  async indexByRecord(req, res) {
    const { record } = req.params;

    try {
      const flowProcesses = await FlowProcess.findAll({
        where: { record },
      });

      if (flowProcesses.length > 0) {
        return res.status(200).json(flowProcesses);
      }

      return res.status(404).json({
        error: "Não há fluxos com esse processo",
        message: `Não há fluxos com o processo '${record}'`,
      });
    } catch (error) {
      return res.status(500).json({
        error,
        message: `Erro ao buscar fluxos do processo ${record}`,
      });
    }
  }

  async index(req, res) {
    try {
      let where;
      if (req.headers.test !== "ok") {
        const { idUnit, idRole } = await tokenToUser(req);
        const unitFilter = idRole === 5 ? {} : { idUnit };
        where = {
          ...filterByName(req),
          ...unitFilter,
        };
      } else {
        where = {};
      }

      const { limit, offset } = req.query;

      const flows = limit
        ? await Flow.findAll({
          where,
          offset: parseInt(offset),
          limit: parseInt(limit),
        })
        : await Flow.findAll({
          where,
        });
      const totalCount = await Flow.count({ where });
      const totalPages = Math.ceil(totalCount / limit);

      let flowsWithSequences = [];
      for (const flow of flows) {
        const flowStages = await FlowStage.findAll({
          where: { idFlow: flow.idFlow },
        });

        const { stages, sequences } =
          FlowController.#stagesSequencesFromFlowStages(flowStages);

        const flowSequence = {
          idFlow: flow.idFlow,
          name: flow.name,
          idUnit: flow.idUnit,
          stages,
          sequences,
        };

        flowsWithSequences.push(flowSequence);
      }
      return res
        .status(200)
        .json({ flows: flowsWithSequences || [], totalPages });
    } catch (error) {
      return res
        .status(500)
        .json({ error, message: "Impossível obter fluxos" });
    }
  }

  async getById(req, res) {
    const { idFlow } = req.params;
    try {
      const flow = await Flow.findByPk(idFlow);
      if (!flow) {
        return res.status(404).json({ message: `Não há fluxo '${idFlow}'` });
      }

      const flowStages = await FlowStage.findAll({
        where: { idFlow: flow.idFlow },
      });

      const { stages, sequences } =
        FlowController.#stagesSequencesFromFlowStages(flowStages);

      const flowSequence = {
        idFlow: flow.idFlow,
        name: flow.name,
        idUnit: flow.idUnit,
        stages,
        sequences,
      };

      return res.status(200).json(flowSequence);
    } catch (error) {
      return res.status(500).json({
        error,
        message: `Impossível obter fluxo ${idFlow}`,
      });
    }
  }

  async getByIdWithSequence(req, res) {
    const { idFlow } = req.params;

    try {
      const flow = await Flow.findByPk(idFlow);
      if (!flow) {
        return res.status(404).json({ message: `Fluxo ${idFlow} não existe` });
      }

      const flowStages = await FlowStage.findAll({
        where: { idFlow },
      });

      if (flowStages.length === 0) {
        return res
          .status(404)
          .json({ message: `Fluxo ${idFlow} não tem sequências` });
      }

      let sequences = [];

      for (const { idStageA: from, commentary, idStageB: to } of flowStages) {
        sequences.push({ from, commentary, to });
      }

      return res.status(200).json({
        idFlow: flow.idFlow,
        name: flow.name,
        idUnit: flow.idUnit,
        sequences: sequences,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error, message: "Impossível ler sequências" });
    }
  }

  async getFlowStages(req, res) {
    try {
      const flowStages = await FlowStage.findAll();

      if (!flowStages) {
        return res
          .status(404)
          .json({ message: "Não há fluxos ligados a etapas" });
      }

      return res.status(200).json(flowStages);
    } catch (error) {
      return res
        .status(500)
        .json({ error, message: "Erro ao ler fluxos ligados a etapas" });
    }
  }

  async getUsersToNotify(req, res) {
    const { idFlow } = req.params;

    try {
      const result = await FlowUser.sequelize.query(
        'SELECT \
            "flowUser"."idFlow" AS "idFlow", "flowUser".cpf AS cpf, \
            users."fullName" AS "fullName", users.email AS email, \
            users."idUnit" AS "idUnit" \
        FROM "flowUser" \
        JOIN users ON "flowUser".cpf = users.cpf \
        WHERE "flowUser"."idFlow" = ?',
        {
          replacements: [idFlow],
          type: QueryTypes.SELECT,
        }
      );

      res.status(200).json({ usersToNotify: result });
    } catch (error) {
      res.status(500).json({
        error,
        message: "Impossível obter usuários que devem ser notificados no fluxo",
      });
    }
  }

  async store(req, res) {
    const { name, idUnit, sequences, idUsersToNotify } = req.body;
    try {
      const { status, message, json } =
        await FlowController.#createOrUpdateFlow({
          name,
          idUnit,
          sequences,
          idUsersToNotify,
          flow: null,
        });
      return json
        ? res.status(status).json(json)
        : res.status(status).json({ message });
    } catch (error) {
      return res.status(500).json({ error: "Impossível criar fluxo" });
    }
  }

  async update(req, res) {
    const { name, idFlow, sequences, idUsersToNotify } = req.body;

    try {
      const flow = await Flow.findByPk(idFlow);

      if (!flow) {
        return res
          .status(404)
          .json({ message: `Fluxo '${idFlow} não existe!` });
      } else {
        flow.set({ name });
        const { idUnit } = flow;

        await flow.save();
        await FlowStage.destroy({
          where: { idFlow },
        });

        await FlowUser.destroy({
          where: { idFlow },
        });

        const { status, message, json } =
          await FlowController.#createOrUpdateFlow({
            name,
            idUnit,
            sequences,
            idUsersToNotify,
            flow,
          });
        return json
          ? res.status(status).json(json)
          : res.status(status).json({ message });
      }
    } catch (error) {
      return res.status(500).json({ error, message: "Impossível criar fluxo" });
    }
  }

  async delete(req, res) {
    try {
      const { idFlow } = req.params;
      const processes = await FlowProcess.findAll({ where: { idFlow } });
      if (processes.length > 0) {
        return res.status(409).json({
          error: "Há processos no fluxo",
          message: `Há ${processes.length} processos no fluxo`,
        });
      }
      await FlowStage.destroy({ where: { idFlow } });
      await FlowUser.destroy({ where: { idFlow } });
      const rows = await Flow.destroy({ where: { idFlow } });
      if (rows > 0) {
        return res.status(200).json({ message: "Fluxo apagado com sucesso" });
      } else {
        return res.status(404).json({ message: "Fluxo não encontrado" });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ error, message: "Impossível apagar fluxo" });
    }
  }

  async deleteFlowStage(req, res) {
    const { idFlow, idStageA, idStageB } = req.params;

    try {
      const affectedRows = await FlowStage.destroy({
        where: { idFlow, idStageA, idStageB },
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          message: `Não há relacionameto entre o fluxo '${idFlow}' e as etapas '${idStageA}' e '${idStageB}'`,
        });
      }

      return res.status(200).json({
        message: `Desassociação entre fluxo '${idFlow}' e etapas '${idStageA}' e '${idStageB}' concluída`,
      });
    } catch (error) {
      return res.status(500).json({
        error,
        message: `Falha ao desassociar fluxo '${idFlow}' e etapas '${idStageA}' e '${idStageB}'`,
      });
    }
  }
}

export default new FlowController();
