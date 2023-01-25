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

  async getById(req, res) {
    const idProcess = req.params.id;

    const process = await Role.findByPk(idProcess);

    if (!process) {
        return res
          .status(404)
          .json({ error: 'Esse processo não existe!' });
      } else {
          return res.json(process);
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

  async allProcesses(req, res) {
    return findProcess(res, { unity: req.user.unity });
  }

  async processesInFlow(req, res) {
    const search = {
      fluxoId: req.params.flowId,
      unity: req.user.unity,
    };

    try {
      const {idFlow} = req.params;

      const processes = await Database.connection.query(
        "SELECT * FROM \"flowProcess\" JOIN \"process\" ON \"flowProcess\".record = process.record WHERE \"flowProcess\".\"idFlow\" = ?",
        {replacements: [idFlow],
        type: QueryTypes.SELECT}
      );

      return res.status(200).json({ processes: processes });
    } catch (error) {
      console.log(error);
      return res.status(500).json({error, message: "Erro ao buscar processos"});
    }
  }

  async getOneProcess(req, res) {
    try {
      const processes = await Process.findOne({
        _id: req.params.id,
      });
      return res.status(200).json({processes});
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }

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
  }

  async newObservation(req, res) {
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
  }
}

export default new ProcessController();
