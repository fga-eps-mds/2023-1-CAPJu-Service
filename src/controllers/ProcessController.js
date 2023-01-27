import FlowProcess from "../models/FlowProcess.js";
import FlowStage from "../models/FlowStage.js";
import Priority from "../models/Priority.js";
import Process from "../models/Process.js";
import Flow from "../models/Flow.js";
import Database from '../database/index.js';
import { QueryTypes } from 'sequelize';
/*import {
  ProcessValidator,
  ProcessEditValidator,
  ProcessNewObservationValidator,
  NextStageValidator,
} from "../validators/Process.js";*/

class ProcessController {

  async index(req, res) {
    const processes = await Process.findAll();

    if (!processes) {
        return res
          .status(404)
          .json({ error: 'Não há processos' });
      } else {
          return res.status(200).json({ processes: processes });
      }
  }

  async getPriorities(req, res) {

    try{

      const priorities = await Priority.findAll({ where : {
        idPriority: [1,2,3,4,5,6,7,8]
      }});

      if(!priorities) {
        return res
        .status(404)
        .json({ error: "Não foi encontrado prioridades"});

      } else {
        return res.status(200).json({ priorities: priorities})
      }
      } catch (error) {
        console.log(error)
      }
  }

  async getPriorityProcess(req, res) {

    const priorityProcesses = await Process.findAll({ where : {
      idPriority: [1,2,3,4,5,6,7,8]
    }});

    if (!priorityProcesses) {
        return res
          .status(404)
          .json({ error: 'Não há processos com prioridade legal' });
      } else {
          return res.status(200).json({ processes: priorityProcesses });
      }
  }

  async getById(req, res) {
    const idProcess = req.params.id;

    try {
      const process = await Process.findByPk(idProcess);

      if (!process) {
          return res
            .status(404)
            .json({
              error: 'Esse processo não existe!',
              message: 'Esse processo não existe!'
            });
        } else {
            return res.json(process);
        }
    } catch(error) {
      console.log(error);
      return res.status(500).json({
        error,
        message: `Erro ao procurar processo ${idProcess}`
      });
    }
  }


  async store(req, res) {
    try {
      const { record, nickname, finalised, effectiveDate, priority,description, idFlow } =
      req.body;
      let priorityProcess;
      const flow = await Flow.findByPk(idFlow);
      const flowStages = await FlowStage.findAll({
        where: { idFlow }
      });

      if (flow){
        const process = await Process.create({
          record,
          idUnit: flow.idUnit,
          nickname,
          idStage: flowStages[0].idStageA,
          effectiveDate,
          idPriority: priority
        });
        const { idProcess } = process;
        try {
          if(flow){
            const flowProcess = await FlowProcess.create({idFlow, record, finalised: false});
            return res.status(200).json({message:"Criado com sucesso!", flowProcess});
          }
        } catch(error) {
          console.log(error);
          return res.status(500).json(error);
        }
      }
      return res.status(200).json({process});
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
      const {idFlow} = req.params;

      const processes = await Database.connection.query(
        "SELECT * FROM \
        \"flowProcess\" \
        JOIN \"process\" ON \
        \"flowProcess\".record = process.record \
        WHERE \"flowProcess\".\"idFlow\" = ?",
        {
          replacements: [idFlow],
          type: QueryTypes.SELECT
        }
      );

      return res.status(200).json({ processes: processes });
    } catch (error) {
      console.log(error);
      return res.status(500).json({error, message: "Erro ao buscar processos"});
    }
  }

  /*async getOneProcess(req, res) {
    try {
      const processes = await Process.findOne({
        _id: req.params.id,
      });
      return res.status(200).json({processes});
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }*/

  async updateProcess(req, res) {
    try {
      //await ProcessEditValidator.validateAsync(req.body);
      const {idFlow, nickname, record} = req.body;
      const process = await Process.findByPk(record);

      const flowStages = await FlowStage.findAll({
        where: {idFlow}
      });

      if (flowStages.length === 0) {
        return res.status(404).json({error: "Não há etapas neste fluxo"});
      }

      if (!process) {
        return res.status(404).json({error: "Não há este processo"});
      }

      process.set({ nickname, idStage: flowStages[0].idStageA });

      await process.save();

      const flowProcesses = await FlowProcess.findAll({
        where: {
          record: process.record
        }
      });

      for (const fp of flowProcesses) {
        fp.set({ idFlow: idFlow });
        fp.save();
      }

      return res.status(200).json({process, flows: flowProcesses});
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }

  async deleteProcess(req, res) {
    try {
      await FlowProcess.destroy({ where: {record: req.params.record }});
      const result = await Process.destroy({ where: {record: req.params.record} });

      if (result === 0) {
        return res.status(404).json({error: `Não há registro ${req.params.record}!`});
      }

      return res.status(200).json({message : "OK" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({error, message: "Impossível apagar"});
    }
  }

  async nextStage(req, res) {
    const { record, from, to, idFlow } = req.body;

    if (isNaN(parseInt(to)) || isNaN(parseInt(to)) || isNan(parseInt(idFlow))) {
      return res.status(400).json({
        error: "Identificadores inválidos",
        message: `Identificadores '${idFlow}', '${from}', ou '${to}' são inválidos`
      });
    }

    try {
      const flowStages = await FlowStage.findAll({
        where: {
          idFlow,
          idStageA: from,
          idStageB: to
        }
      });
      let canAdvance = false;
      if (flowStages?.length > 0) {
        for (const flowStage of flowStages) {
          if (flowStage.idStageA === from && flowStage.idStageB === to) {
            canAdvance = true;
            break;
          }
        }
      }

      if (!canAdvance) {
        return res.status(409).json({
          error: "Transição impossível",
          message: `Não há a transição da etapa '${to}' para '${from}' no fluxo '${idFlow}'`
        });
      }
      const process = await Process.update(
        {
          idStage: to,
          effectiveDate: new Date()
        },
        {
          where: {
            record,
            idStage: from
          }
        }
      );
      console.log(process[0]);
      if (process[0] > 0) {
        return res.status(200).json({
          message: "Etapa avançada com sucesso"
        });
      }

      return res.status(409).json({
        error: "Impossível avançar etapa",
        message: `Impossível avançar processo '${record}' para etapa '${to}`
      });
    } catch(error) {
      console.log(error);
      return res.status(500).json({
        error,
        message: `Erro ao avançar processo '${record}' para etapa '${to}`
      });
    }
  }

  /*async nextStage(req, res) {
    try {
      const body = await NextStageValidator.validateAsync(req.body);
      const { stageIdTo, stageIdFrom, observation } = body;
      const search = { _id: body.processId };
      const process = await Process.findOne(search);

      let foundStage = process.etapas.find((etapa) =>
        etapa.stageIdTo == body.stageIdTo
      );

      if (foundStage === undefined) {
        process.etapas.push({
          stageIdTo: stageIdTo,
          stageIdFrom: stageIdFrom,
          observation: observation,
          createdAt: new Date(),
        });
      }  else {
        process.etapas.forEach((process) => {
          if (process.stageIdTo == stageIdTo)
            process.observation = observation;
        })
      }

      const result = await Process.updateOne(search, {
        etapaAtual: body.stageIdTo,
        etapas: process.etapas,
      });

      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }*/

  async newObservation(req, res) {
    const { record, originStage, destinationStage, commentary } = req.body;

    try {
      const updateResult = await Database.connection.query(
        "update \
          \"flowStage\" \
        set \
          \"idStageA\" = ?, \
          \"idStageB\" = ?, \
          commentary = ? \
        where \
          \"idFlowStage\" in ( \
        select \
          fst.\"idFlowStage\" as \"idFlowStage\" \
        from \
          \"flowProcess\" fp \
        join \"flowStage\" fst \
        on \
          fst.\"idFlow\" = fp.\"idFlow\" \
        where \
          fp.record = ? \
          and fst.\"idStageA\" = ? \
          and fst.\"idStageB\" = ?)",
        {
          replacements: [
            originStage,
            destinationStage,
            commentary,
            record,
            originStage,
            destinationStage
          ],
          type: QueryTypes.UPDATE
        }
      );

      console.log('updateResult = ', updateResult);
      return res.status(200).json({
        message: "Comentário adicionado com sucesso"
      });
    } catch(error) {
      console.log(error);
      return res.status(500).json({
        error,
        message: "Falha ao adicionar comentário"
      });
    }
  }

  /*async newObservation(req, res) {
    try {
      const body = await ProcessNewObservationValidator.validateAsync(req.body);
      const { observation, originStage, destinationStage, processId } = body;
      const search = { _id: processId };
      const process = await Process.findOne(search);

      let foundStage = process.etapas.find((etapa) =>
        etapa.stageIdTo === destinationStage
      );

      if (foundStage === undefined) {
        process.etapas.push({
          createdAt: new Date(),
          stageIdTo: destinationStage,
          stageIdFrom: originStage,
          observation,
        })
      } else {
        process.etapas.forEach((process) => {
          if (process.stageIdTo == destinationStage)
            process.observation = observation;
        })
      }

      const result = await Process.updateOne(search, {
        etapas: process.etapas,
      });

      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }*/
}

export default new ProcessController();
