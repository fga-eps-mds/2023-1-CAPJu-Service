import Process from "../schemas/Process.js";
import {
  ProcessValidator,
  ProcessEditValidator,
  // ProcessNewObsercationValidator,
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
      const { registro, apelido, etapaAtual, etapas, arquivado, fluxoId } =
        await ProcessValidator.validateAsync(req.body);

      const process = await Process.create({
        registro,
        apelido,
        etapaAtual,
        arquivado,
        etapas,
        fluxoId,
        unity: req.user.unity,
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
      
      let foundStage = processes.etapas.find((etapa) => 
        etapa.stageIdTo == body.stageIdTo
      );

      const advanceStage = {
        stageIdTo: body.stageIdTo,
        stageIdFrom: body.stageIdFrom,
        observation: body.observation,
        createdAt: new Date(),
      }

      if(!foundStage){
        processes.etapas.push(advanceStage);
      }else{
        foundStage.observation = body.observation;
        processes.etapas = [...processes.etapas, foundStage];
      }

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

  async newObservation(req, res) {
    try {
      const { observation, originStage, destinationStage, processId } =
        req.body;
      // const body = await ProcessNewObsercationValidator.validateAsync(req.body);
      const search = { _id: processId };
      const process = await Process.findOne(search);

      let foundStage = process.etapas.find((etapa) => 
        etapa.stageIdTo === destinationStage
      );

      const newObservation = {
        createdAt: new Date(),
        stageIdTo: destinationStage,
        stageIdFrom: originStage,
        observation,
      };
      
      if (!foundStage) {
        process.etapas.push(newObservation);
      } else {
        foundStage.observation = observation;
        process.etapas = [...process.etapas, foundStage];
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
