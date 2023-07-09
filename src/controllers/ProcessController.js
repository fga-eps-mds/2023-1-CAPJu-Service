import FlowProcess from "../models/FlowProcess.js";
import FlowStage from "../models/FlowStage.js";
import Priority from "../models/Priority.js";
import Process from "../models/Process.js";
import Flow from "../models/Flow.js";
import Stage from "../models/Stage.js";
import Database from "../database/index.js";
import { QueryTypes } from "sequelize";
import { tokenToUser } from "../middleware/authMiddleware.js";
import { filterByNicknameAndRecord } from "../utils/filters.js";

const validateRecord = (record) => {
  const filteredRecord = record.replace(/[^\d]/g, "");
  const regexFilter = /^\d{20}$/;
  const isRecordValid = regexFilter.test(filteredRecord);

  return {
    filteredRecord,
    valid: isRecordValid,
  };
};

const IsUtilDay = (data) => {
  const diaDaSemana = data.getDay();
  return diaDaSemana >= 1 && diaDaSemana <= 5;
};

const handleVerifyDate = (startDate, duration) => {
  let days = 0;
  while (duration > 0) {
    startDate.setDate(startDate.getDate() + 1);
    if (IsUtilDay(startDate)) {
      duration--;
    }
    days++;
  }
  return days;
};

class ProcessController {
  async index(req, res) {
    try {
      let where;
      const { idUnit, idRole } = await tokenToUser(req);
      const unitFilter = idRole === 5 ? {} : { idUnit };
      where = {
        ...filterByNicknameAndRecord(req),
        ...unitFilter,
      };
      const offset = parseInt(req.query.offset) || 0;
      const limit = parseInt(req.query.limit) || 10;
      const processes = await Process.findAll({
        where,
        limit,
        offset,
      });

      if (!processes || processes.length === 0) {
        return res.status(204).json([]);
      } else {
        const processesWithFlows = [];
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
            progress: process.progress,
          });
        }

        const totalCount = await Process.count({ where });
        const totalPages = Math.ceil(totalCount / limit) || 0;

        return res
          .status(200)
          .json({ processes: processesWithFlows, totalPages });
      }
    } catch (error) {
      return res.status(500).json({
        error,
        message: "Erro ao buscar processos",
      });
    }
  }

  async getPriorities(_req, res) {
    try {
      const priorities = await Priority.findAll({
        where: {
          idPriority: [1, 2, 3, 4, 5, 6, 7, 8],
        },
      });

      if (!priorities) {
        return res.status(204).json([]);
      } else {
        return res.status(200).json(priorities);
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async getPriorityProcess(_req, res) {
    const priorityProcesses = await Process.findAll({
      where: {
        idPriority: [1, 2, 3, 4, 5, 6, 7, 8],
      },
    });

    if (!priorityProcesses) {
      return res.status(204).json([]);
    } else {
      return res.status(200).json(priorityProcesses);
    }
  }

  async getById(req, res) {
    const idProcess = req.params.id;

    try {
      const process = await Process.findByPk(idProcess);

      if (!process) {
        return res.status(204).json({});
      } else {
        return res.status(200).json(process);
      }
    } catch (error) {
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

      const record = recordStatus.filteredRecord;

      const flow = await Flow.findByPk(idFlow);

      if (flow) {
        await Process.create({
          record,
          idUnit: flow.idUnit,
          nickname,
          idPriority: priority,
        });
        if (flow) {
          const flowProcess = await FlowProcess.create({
            idFlow,
            record,
            finalised: false,
          });
          return res.status(200).json(flowProcess);
        }
      }
      return res.status(500).json({ error: "Erro na criação de processo" });
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async processesInFlow(req, res) {
    try {
      const { idFlow } = req.params;

      const offset = parseInt(req.query.offset) || 0;
      const limit = parseInt(req.query.limit) || 10;

      const processes = await Database.connection.query(
        'SELECT * FROM \
        "flowProcess" \
        JOIN "process" ON \
        "flowProcess".record = process.record \
        WHERE "flowProcess"."idFlow" = ? \
        OFFSET ? \
        LIMIT ?',
        {
          replacements: [idFlow, offset, limit],
          type: QueryTypes.SELECT,
        }
      );
      const countQuery = await Database.connection.query(
        'SELECT COUNT(*) as total FROM \
        "flowProcess" \
        JOIN "process" ON \
        "flowProcess".record = process.record \
        WHERE "flowProcess"."idFlow" = ?',
        {
          replacements: [idFlow],
          type: QueryTypes.SELECT,
        }
      );

      const totalCount = countQuery[0].total;
      const totalPages = Math.ceil(totalCount / limit) || 0;

      return res.status(200).json({ processes, totalPages });
    } catch (error) {
      return res.status(500).json(error);
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

      const record = recordStatus.filteredRecord;

      const process = await Process.findByPk(record);

      const flowStages = await FlowStage.findAll({
        where: { idFlow },
      });

      if (flowStages.length === 0) {
        return res.status(404).json({ message: "Não há etapas neste fluxo" });
      }

      if (!process) {
        return res.status(404).json({ message: "processo inexistente" });
      }

      const startingProcess =
        process.status === "notStarted" && status === "inProgress"
          ? {
              idStage: flowStages[0].idStageA,
              effectiveDate: new Date(),
            }
          : {};
      let tempProgress = [];
      if (process.status === "notStarted" && status === "inProgress") {
        const currentStage = await Stage.findOne({
          where: { idStage: flowStages[0].idStageA },
        });

        const stageStartDate = new Date();
        const stageEndDate = new Date(stageStartDate);
        stageEndDate.setDate(
          stageEndDate.getDate() +
            handleVerifyDate(stageStartDate, currentStage.duration)
        );

        const progressData = {
          idStage: flowStages[0].idStageA,
          entrada: new Date(),
          vencimento: stageEndDate,
        };
        tempProgress.push(progressData);
      } else {
        tempProgress = process.progress;
      }

      process.set({
        nickname,
        idStage: idStage || process.idStage,
        idPriority: priority,
        status,
        progress: tempProgress,
        ...startingProcess,
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
      return res.status(500).json(error);
    }
  }

  async updateProcessStage(req, res) {
    const { record, from, to, idFlow, isNextStage } = req.body;

    if (
      isNaN(parseInt(from)) ||
      isNaN(parseInt(to)) ||
      isNaN(parseInt(idFlow))
    ) {
      return res.status(400).json({
        error: "Identificadores inválidos",
        message: `Identificadores '${idFlow}', '${from}' ou '${to}' são inválidos`,
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
          if (
            (flowStage.idStageA === from && flowStage.idStageB === to) ||
            (flowStage.idStageB === from && flowStage.idStageA === to)
          ) {
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

      const currentProcess = await Process.findOne({
        where: { record },
      });
      const currentToStage = await Stage.findOne({
        where: { idStage: to },
      });

      let tempProgress = [];
      let maturityDate;
      const stageStartDate = new Date();
      const stageEndDate = new Date(stageStartDate);
      stageEndDate.setDate(
        stageEndDate.getDate() +
          handleVerifyDate(stageStartDate, currentToStage.duration)
      );

      maturityDate = stageEndDate;

      if (isNextStage) {
        const progressData = {
          idStage: to,
          entrada: new Date(),
          vencimento: maturityDate,
        };
        tempProgress = currentProcess.progress;
        const index = tempProgress.findIndex((x) => x.idStage == to);
        index === -1 && tempProgress.push(progressData);
      } else {
        tempProgress = Array.isArray(currentProcess.progress)
          ? currentProcess.progress
          : [currentProcess.progres];
        tempProgress.pop();
        tempProgress[tempProgress.length - 1] = {
          idStage: to,
          entrada: new Date(),
          vencimento: maturityDate,
        };
      }

      console.log("FROM TO", currentProcess.idStage, from, to);

      const process = await Process.update(
        {
          idStage: to,
          effectiveDate: new Date(),
          progress: tempProgress,
        },
        {
          where: {
            record,
            idStage: from,
          },
        }
      );
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
      return res.status(500).json(error);
    }
  }
}

export default new ProcessController();
