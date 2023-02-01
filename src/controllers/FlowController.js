import Flow from "../models/Flow.js";
import Stage from "../models/Stage.js";
import FlowStage from "../models/FlowStage.js";
import User from "../models/User.js";
import FlowUser from "../models/FlowUser.js";
import FlowProcess from "../models/FlowProcess.js";
import { QueryTypes } from "sequelize";
import Database from "../database/index.js";

class FlowController {
  static #stagesSequencesFromFlowStages(flowStages) {
    let sequences = [];
    let stages = [];
    if (flowStages.length > 0) {
      for (const { idStageA: from, commentary, idStageB: to } of flowStages) {
        sequences.push({
          from,
          commentary,
          to,
        });
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

  async indexByRecord(req, res) {
    const { record } = req.params;

    try {
      const flowProcesses = await FlowProcess.findAll({
        where: {
          record,
        },
      });

      if (flowProcesses.length > 0) {
        return res.status(200).json(flowProcesses);
      }

      return res.status(404).json({
        error: "Não há fluxos com esse processo",
        message: `Não há fluxos com o processo '${record}'`,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
        message: `Erro ao buscar fluxos do processo ${record}`,
      });
    }
  }

  async index(req, res) {
    try {
      const flows = await Flow.findAll();
      let flowsWithSequences = [];
      for (const flow of flows) {
        const flowStages = await FlowStage.findAll({
          where: {
            idFlow: flow.idFlow,
          },
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

      return res.status(200).json(flowsWithSequences);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error, message: "Impossível obter fluxos" });
    }
  }

  async getById(req, res) {
    const { idFlow } = req.params;
    try {
      const flow = await Flow.findByPk(idFlow);
      const flowStages = await FlowStage.findAll({
        where: {
          idFlow: flow.idFlow,
        },
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
      console.log(error);
      return res.status(500).json({
        error,
        message: `Impossível obter fluxo ${idFlow}`,
      });
    }
  }

  async getByIdWithSequence(req, res) {
    const { idFlow } = req.params;

    const flow = await Flow.findByPk(idFlow);
    if (!flow) {
      return res.status(401).json({ error: "Esse fluxo não existe" });
    }

    const flowStages = await FlowStage.findAll({
      where: {
        idFlow,
      },
    });

    if (flowStages.length === 0) {
      return res.status(401).json({ error: "Este fluxo não tem sequências" });
    }

    let sequences = [];

    for (let i = 0; i < flowStages.length; i++) {
      sequences.push({
        from: flowStages[i].idStageA,
        commentary: flowStages[i].commentary,
        to: flowStages[i].idStageB,
      });
    }

    return res.status(200).json({
      idFlow: flow.idFlow,
      name: flow.name,
      idUnit: flow.idUnit,
      sequences: sequences,
    });
  }

  async getFlowStages(req, res) {
    const flowStages = await FlowStage.findAll();

    if (!flowStages) {
      return res.status(401).json({ error: "Não há fluxos ligados a etapas" });
    }

    return res.status(200).json(flowStages);
  }

  async getUsersToNotify(req, res) {
    const { idFlow } = req.params;

    try {
      const result = await Database.connection.query(
        'SELECT \
                "flowUser"."idFlow", "flowUser".cpf, users."fullName", users.email, users."idUnit" \
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
      console.log(error);
      res.status(500).json({
        error: "Impossível obter usuários que devem ser notificados no fluxo",
      });
    }
  }

  async store(req, res) {
    const { name, idUnit, sequences, idUsersToNotify } = req.body;
    try {
      for (const idUser of idUsersToNotify) {
        const user = await User.findOne({
          where: { cpf: idUser, idUnit },
        });

        if (!user) {
          return res.status(404).json({
            message: `Usuário '${idUser}' não existe na unidade '${idUnit}'`,
          });
        }
      }

      if (sequences.length < 1) {
        return res
          .status(400)
          .json({ message: "Necessário pelo menos duas etapas!" });
      } else {
        for (const sequence of sequences) {
          const { from: idStageA, to: idStageB } = sequence;

          if (idStageA == idStageB) {
            return res.status(400).json({
              message: "Sequências devem ter início e fim diferentes",
            });
          }

          const stageA = await Stage.findByPk(idStageA);
          if (!stageA) {
            return res.status(404).json({
              message: `Não existe a etapa com identificador '${idStageA}'`,
            });
          }
          const stageB = await Stage.findByPk(idStageB);
          if (!stageB) {
            return res.status(404).json({
              message: `Não existe a etapa com identificador '${idStageB}'`,
            });
          }
        }
        const flow = await Flow.create({ name, idUnit });
        const idFlow = flow.idFlow;

        for (const sequence of sequences) {
          await FlowStage.create({
            idFlow,
            idStageA: sequence.from,
            idStageB: sequence.to,
            commentary: sequence.commentary,
          });
        }

        for (const idUser of idUsersToNotify) {
          await FlowUser.create({
            cpf: idUser,
            idFlow,
          });
        }

        return res.status(200).json({
          idFlow: idFlow,
          name: flow.name,
          idUnit: idUnit,
          sequences,
          usersToNotify: idUsersToNotify,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Impossível criar fluxo" });
    }
  }

  async update(req, res) {
    const { name, idFlow, sequences, idUsersToNotify } = req.body;

    try {
      const flow = await Flow.findByPk(idFlow);

      if (!flow) {
        return res.status(401).json({ error: "Esse fluxo não existe!" });
      } else {
        flow.set({ name });

        await flow.save();
        const flowStage = await FlowStage.destroy({
          where: { idFlow: idFlow },
        });

        const flowUser = await FlowUser.destroy({
          where: { idFlow: idFlow },
        });

        for (const idUser of idUsersToNotify) {
          const user = await User.findByPk(idUser);

          if (!user) {
            return res
              .status(401)
              .json({ error: `Usuário '${idUser}' não existe` });
          }
        }

        if (sequences.length < 1) {
          return res
            .status(401)
            .json({ error: "Necessário pelo menos duas etapas!" });
        } else {
          for (const sequence of sequences) {
            const idStageA = sequence.from;
            const idStageB = sequence.to;

            if (idStageA == idStageB) {
              return res.status(401).json({
                error: "Sequências devem ter início e fim diferentes",
              });
            }

            const stageA = await Stage.findByPk(idStageA);
            if (!stageA) {
              return res.status(401).json({
                error: `Não existe a etapa com identificador '${idStageA}'`,
              });
            }
            const stageB = await Stage.findByPk(idStageB);
            if (!stageB) {
              return res.status(401).json({
                error: `Não existe a etapa com identificador '${idStageB}'`,
              });
            }
          }
          const idFlow = flow.idFlow;

          for (const sequence of sequences) {
            const flowStage = await FlowStage.create({
              idFlow,
              idStageA: sequence.from,
              idStageB: sequence.to,
              commentary: sequence.commentary,
            });
          }

          for (const idUser of idUsersToNotify) {
            const flowUser = await FlowUser.create({
              cpf: idUser,
              idFlow,
            });
          }

          return res.status(200).json({
            idFlow: idFlow,
            name: flow.name,
            sequences,
            usersToNotify: idUsersToNotify,
          });
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Impossível criar fluxo" });
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
        return res.status(200).json({ message: "Apagado com sucesso" });
      } else {
        return res.status(404).json({ message: "Fluxo não encontrado" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error, message: "Impossível apagar" });
    }
  }

  async deleteFlowStage(req, res) {
    const { idFlow, idStageA, idStageB } = req.params;

    const affectedRows = await FlowStage.destroy({
      where: {
        idFlow,
        idStageA,
        idStageB,
      },
    });

    if (affectedRows === 0) {
      return res.status(401).json({
        error: `Não há relacionameto entre o fluxo '${idFlow}' e as etapas '${idStageA}' e '${idStageB}'`,
      });
    }

    return res.status(200).json({
      message: `Desassociação entre fluxo '${idFlow}' e etapas '${idStageA}' e '${idStageB}' concluída`,
    });
  }
}

export default new FlowController();
