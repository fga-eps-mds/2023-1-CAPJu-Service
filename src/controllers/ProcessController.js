import Priority from "../models/Priority.js";
import Process from "../schemas/Process.js";
import {
  ProcessValidator,
  ProcessEditValidator,
  NextStageValidator,
} from "../validators/Process.js";

const findProcess = async (res, search) => {
  try {
    const processes = await Process.find(search);
    return res.status(200).json({
      processes,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

class ProcessController {
  async createProcess(req, res) {
    try {
      const { record, idUnit, nickname, idStage, effectiveDate, priority,description, idFlow, finalised } =
        req.body;
      let priorityProcess;
      if(priority){
        priorityProcess = Priority.create({description});
      }

      const process = await Process.create({
        record,
        idUnit, 
        nickname, 
        idStage, 
        effectiveDate,
        idPriority: priorityProcess.idPriority,
      });

      return res.status(200).json(process);
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
      return res.status(200).json(processes);
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
