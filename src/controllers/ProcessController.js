import FlowProcess from "../models/FlowProcess.js";
import Priority from "../models/Priority.js";
import Process from "../models/Process.js";
import Flow from "../models/Flow.js";
import {
  ProcessValidator,
  ProcessEditValidator,
  NextStageValidator,
} from "../validators/Process.js";

class ProcessController {

  async index(req, res) {
  
    const processes = await Process.findAll();

    if (!processes) {
        return res
          .status(401)
          .json({ error: 'Não existe processos' });
      } else {
          return res.json(role);
      }
  }

  async getById(req, res) {
    const idProcess = req.params.id;

    const process = await Role.findByPk(idProcess);

    if (!process) {
        return res
          .status(401)
          .json({ error: 'Esse processo não existe!' });
      } else {
          return res.json(process);
      }
}

  async store(req, res) {
    try {
      const { record, idUnit, nickname, idStage, effectiveDate, priority,description, idFlow } =
        req.body;
      let priorityProcess;
      const flow = await Flow.findByPk(idFlow);
      if(flow){
        if(priority){
          priorityProcess = await Priority.create({description});
          const { idPriority } = priorityProcess;

          console.log("=======================")
          console.log(priorityProcess);
          console.log("=======================")

          const process = await Process.create({
            record,
            idUnit, 
            nickname, 
            idStage, 
            effectiveDate,
            idPriority,
          });
        } else {
          const process = await Process.create({
            record,
            idUnit, 
            nickname, 
            idStage, 
            effectiveDate,
            idPriority: 20
          });
        }
        
        const { idProcess } = process;
  
        try {
          if(flow){
            console.log("=======================")
            console.log(idFlow);
            console.log("=======================")
          const flowProcess = await FlowProcess.create({idFlow, record, idProcess, finalised: false});
          return res.status(200).json({message:"Caiu aqui!"});
          
        }
        } catch(err) {
          console.log(err);
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
    return findProcess(res, search);
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
      await ProcessEditValidator.validateAsync(req.body);
      const process = await Process.updateOne({ _id: req.params.id }, req.body);

      return res.status(200).json(process);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }

  async deleteProcess(req, res) {
    try {
      const result = await Process.deleteOne({ registro: req.params.registro });

      console.log(result);
      if (result.deletedCount === 0) {
        throw new Error(`Não há registro ${req.params.registro}!`);
      }

      res.json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }

  async nextStage(req, res) {
    try {
      const body = await NextStageValidator.validateAsync(req.body);
      const search = { _id: body.processId };
      const processes = await Process.findOne(search);

      processes.etapas.push({
        stageIdTo: body.stageIdTo,
        stageIdFrom: body.stageIdFrom,
        observation: body.observation,
        createdAt: new Date(),
      });

      const result = await Process.updateOne(search, {
        etapaAtual: body.stageIdTo,
        etapas: processes.etapas,
      });

      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
}

export default new ProcessController();
