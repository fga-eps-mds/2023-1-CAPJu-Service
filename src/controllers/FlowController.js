import Flow from "../schemas/Flow.js";
import Stage from "../schemas/Stage.js";
import { FlowValidator, FlowEditValidator } from "../validators/Flow.js";

class FlowController {
  async createFlow(req, res) {
    try {
      const { name, stages, sequences, users } = await FlowValidator.validateAsync(
        req.body
      );

      for (const stage of stages) {
        const existing = await Stage.find({ _id: stage });
        if (!existing)
          return res.status(404).json({ message: "Etapa não encontrada" });
      }

      for (const sequence of sequences) {
        if (!stages.includes(sequence.from) || !stages.includes(sequence.to)) {
          return res.status(404).json({ message: "Sequência inválida" });
        }
      }

      const flow = await Flow.create({
        name,
        stages,
        sequences,
        users,
        deleted: false,
        unity: req.user.unity,
      });

      console.log(flow);
      return res.status(200).json(flow);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }

  async allFlows(req, res) {
    try {
      const Flows = await Flow.find({ deleted: false, unity: req.user.unity, });
      return res.status(200).json({
        Flows,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }

  async deleteFlow(req, res) {
    try {
      const flowId = req.body.flowId;
      const flow = await Flow.findOne({ _id: flowId });

      if (!flow) {
        return res.status(404).json({
          message: "Flow not found",
        });
      }

      const result = await Flow.updateOne(
        { _id: flow._id },
        { deleted: true },
        { upsert: true }
      );

      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }

  async editFlow(req, res) {
    try {
      const body = await FlowEditValidator.validateAsync(req.body);

      const result = await Flow.updateOne({ _id: body._id }, body);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }

  async getFlow(req, res) {
    try {
      const result = await Flow.findOne({ _id: req.params.id });
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }
}

export default new FlowController();
