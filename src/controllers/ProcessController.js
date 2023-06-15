import FlowProcess from "../models/FlowProcess.js";
import FlowStage from "../models/FlowStage.js";
import Priority from "../models/Priority.js";
import Process from "../models/Process.js";
import Flow from "../models/Flow.js";
import Database from "../database/index.js";
import { QueryTypes } from "sequelize";
import { tokenToUser } from "../middleware/authMiddleware.js";

const isRecordValid = (record) => {
  const regex = /^\d{20}$/;
  return regex.test(record);
};

const recordFilter = (record) => {
  const regex = /[^\d]/g;
  return record.replace(regex, "");
};

const validateRecord = (record) => {
  const filtered = recordFilter(record);
  return {
    filtered,
    valid: isRecordValid(filtered),
  };
};

class ProcessController {
  async index(req, res) {
    try {
      const { idUnit, idRole } = await tokenToUser(req);
      const where = idRole === 5 ? {} : { idUnit };

      let processes = await Process.findAll({
        where,
      });
      if (!processes) {
        return res.status(404).json({ error: "Não há processos" });
      } else {
        let processesWithFlows = [];
        for (const process of processes) {
          const flowProcesses = await FlowProcess.findAll({
            where: {
              record: process.record,
            },
          });
          const flowProcessesIdFlows = flowProcesses.map((flowProcess) => {
            return flowProcess.idFlow;
          });

          processesWithFlows.push({
            record: process.record,
            nickname: process.nickname,
            effectiveDate: process.effectiveDate,
            idUnit: process.idUnit,
            idStage: process.idStage,
            idPriority: process.idPriority,
            idFlow: flowProcessesIdFlows,
            status: process.status,
          });
        }
        return res.status(200).json(processesWithFlows);
      }
    } catch (error) {
      return res.status(500).json({
        error,
        message: "Erro ao buscar processos",
      });
    }
  }

  async getPriorities(req, res) {
    try {
      const priorities = await Priority.findAll({
        where: {
          idPriority: [1, 2, 3, 4, 5, 6, 7, 8],
        },
      });

      if (!priorities) {
        return res
          .status(404)
          .json({ error: "Não foi encontrado prioridades" });
      } else {
        return res.status(200).json(priorities);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getPriorityProcess(req, res) {
    const priorityProcesses = await Process.findAll({
      where: {
        idPriority: [1, 2, 3, 4, 5, 6, 7, 8],
      },
    });

    if (!priorityProcesses) {
      return res
        .status(404)
        .json({ error: "Não há processos com prioridade legal" });
    } else {
      return res.status(200).json(priorityProcesses);
    }
  }

  async getById(req, res) {
    const idProcess = req.params.id;

    try {
      const process = await Process.findByPk(idProcess);

      if (!process) {
        return res.status(404).json({
          error: "Esse processo não existe!",
          message: "Esse processo não existe!",
        });
      } else {
        return res.json(process);
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
        message: `Erro ao procurar processo ${idProcess}`,
      });
    }
  }

  async store(req, res) {
    try {
      let { nickname, priority, idFlow } = req.body;

      const recordStatus = validateRecord(req.body.record);

      if (!recordStatus.valid) {
        return res.status(400).json({
          error: "Registro fora do padrão CNJ",
          message: `Registro '${req.body?.record}' está fora do padrão CNJ`,
        });
      }

      const record = recordStatus.filtered;

      const flow = await Flow.findByPk(idFlow);

      if (flow) {
        await Process.create({
          record,
          idUnit: flow.idUnit,
          nickname,
          idPriority: priority,
        });
        try {
          if (flow) {
            const flowProcess = await FlowProcess.create({
              idFlow,
              record,
              finalised: false,
            });
            return res
              .status(200)
              .json({ message: "Criado com sucesso!", flowProcess });
          }
        } catch (error) {
          console.log(error);
          return res.status(500).json(error);
        }
      }
      return res.status(200).json({ process });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }

  /*async allProcesses(req, res) {
    return findProcess(res, { unity: req.user.unity });
  }*/

  async processesInFlow(req, res) {
    /*const search = {
      fluxoId: req.params.flowId,
      unity: req.user.unity,
    };*/

    try {
      const { idFlow } = req.params;

      const processes = await Database.connection.query(
        'SELECT * FROM \
        "flowProcess" \
        JOIN "process" ON \
        "flowProcess".record = process.record \
        WHERE "flowProcess"."idFlow" = ?',
        {
          replacements: [idFlow],
          type: QueryTypes.SELECT,
        }
      );

      return res.status(200).json(processes);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error, message: "Erro ao buscar processos" });
    }
  }

  async updateProcess(req, res) {
    try {
      const { idFlow, nickname, priority, status, idStage } = req.body;
      
      const recordStatus = validateRecord(req.body.record);

      if (!recordStatus.valid) {
        return res.status(400).json({
          error: "Registro fora do padrão CNJ",
          message: `Registro '${req.body?.record}' está fora do padrão CNJ`,
        });
      }

      const record = recordStatus.filtered;

      const process = await Process.findByPk(record);

      const flowStages = await FlowStage.findAll({
        where: { idFlow },
      });

      if (flowStages.length === 0) {
        return res.status(404).json({ error: "Não há etapas neste fluxo" });
      }

      if (!process) {
        return res.status(404).json({ error: "processo inexistente" });
      }

      const startingProcess = process.status === "notStarted" && status === "inProgress" ? { 
        idStage:flowStages[0].idStageA,
        effectiveDate: new Date(),
       } : {}

      process.set({
        nickname,
        idStage: idStage || process.idStage,
        idPriority: priority,
        status,
        ...startingProcess
      });

      await process.save();

      const flowProcesses = await FlowProcess.findAll({
        where: {
          record: process.record,
        },
      });

      for (const fp of flowProcesses) {
        fp.set({ 
          idFlow: idFlow, 
          status: status,
        });
        fp.save();
      }

      return res.status(200).json({ process, flows: flowProcesses });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }

  async deleteProcess(req, res) {
    try {
      await FlowProcess.destroy({ where: { record: req.params.record } });
      const result = await Process.destroy({
        where: { record: req.params.record },
      });

      if (result === 0) {
        return res
          .status(404)
          .json({ error: `Não há registro ${req.params.record}!` });
      }

      return res.status(200).json({ message: "OK" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error, message: "Impossível apagar" });
    }
  }

  async updateProcessStage(req, res) {
    const { record, from, to, idFlow } = req.body;

    if (isNaN(parseInt(from)) || isNaN(parseInt(to)) || isNaN(parseInt(idFlow))) {
      return res.status(400).json({
        error: "Identificadores inválidos",
        message: `Identificadores '${idFlow}', '${from}', ou '${to}' são inválidos`,
      });
    }

    try {
      const flowStages = await FlowStage.findAll({
        where: {
          idFlow,
        },
      });

      let canAdvance = false;

      if (flowStages?.length > 0) {
        for (const flowStage of flowStages) {
          if (flowStage.idStageA === from && flowStage.idStageB === to || flowStage.idStageB === from && flowStage.idStageA === to) {
            canAdvance = true;
            break;
          }
        }
      }

      if (!canAdvance) {
        return res.status(409).json({
          error: "Transição impossível",
          message: `Não há a transição da etapa '${to}' para '${from}' no fluxo '${idFlow}'`,
        });
      }
      const process = await Process.update(
        {
          idStage: to,
          effectiveDate: new Date(),
        },
        {
          where: {
            record,
            idStage: from,
          },
        }
      );
      console.log(process[0]);
      if (process[0] > 0) {
        return res.status(200).json({
          message: "Etapa atualizada com sucesso",
        });
      }

      return res.status(409).json({
        error: "Impossível atualizar etapa",
        message: `Impossível atualizar processo '${record}' para etapa '${to}`,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
        message: `Erro ao atualizar processo '${record}' para etapa '${to}`,
      });
    }
  }

  async newObservation(req, res) {
    const { record, originStage, destinationStage, commentary } = req.body;

    try {
      const updateResult = await Database.connection.query(
        'update \
          "flowStage" \
        set \
          "idStageA" = ?, \
          "idStageB" = ?, \
          commentary = ? \
        where \
          "idFlowStage" in ( \
        select \
          fst."idFlowStage" as "idFlowStage" \
        from \
          "flowProcess" fp \
        join "flowStage" fst \
        on \
          fst."idFlow" = fp."idFlow" \
        where \
          fp.record = ? \
          and fst."idStageA" = ? \
          and fst."idStageB" = ?)',
        {
          replacements: [
            originStage,
            destinationStage,
            commentary,
            record,
            originStage,
            destinationStage,
          ],
          type: QueryTypes.UPDATE,
        }
      );

      console.log("updateResult = ", updateResult);
      return res.status(200).json({
        message: "Comentário adicionado com sucesso",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
        message: "Falha ao adicionar comentário",
      });
    }
  }
}

export default new ProcessController();
