import Process from "../schemas/Process.js";
import {
  ProcessValidator,
  ProcessEditValidator,
  ProcessNewObservationValidator,
  NextStageValidator,
  updateObservation,
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

  async updateObservation (req, res){
    try{
      const body = await updateObservation.validateAsync(req.body);
      const search = { _id: body.processId };
      const process = await Process.findOne(search);
      const index = process.etapas.map (etapa => etapa.stageIdFrom).indexOf(body.stageIdFrom);

      process.etapas[index].observation = body.observation;

      const result = await Process.updateOne(search, {
        etapas: process.etapas
      })

      return res.status(200).json(result);
    } catch(error){
      console.log(error);
      return res.status(500).json(error);
    }
  }
}

export default new ProcessController();
