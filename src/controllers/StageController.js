import Stage from "../models/Stage.js";
import FlowStage from "../models/FlowStage.js";
import { Op } from "sequelize";
import { tokenToUser } from "../middleware/authMiddleware.js";

class StageController {

  async index(req, res) {
    const { idUnit, idRole } = await tokenToUser(req);
    const where = idRole === 5 ? {} : { idUnit };

    const stages = await Stage.findAll({
      where,
    });

    if (!stages) {
      return res.status(401).json({ error: "Não Existem fluxos" });
    } else {
      return res.json(stages);
    }
  }

  async getById(req, res) {
    const idStage = req.params.id;

    const stage = await Stage.findByPk(idStage);

    if (!stage) {
      return res.status(401).json({ error: "Esse fluxo não existe" });
    } else {
      return res.status(200).json(stage);
    }
  }

  async store(req, res) {
    const { name, idUnit, duration } = req.body;
    try {
      const stage = await Stage.create({
        name: name.toLowerCase(),
        idUnit,
        duration,
      });

      return res.json(stage);
    } catch (error) {
      console.log(error);
      return res.status(error).json(error);
    }
  }

  async delete(req, res) {
    try {
      const idStage = req.params.id;

      const flowStages = await FlowStage.findAll({
        where: {
          [Op.or]: [
            { idStageA: idStage },
            { idStageB: idStage },
          ]
        }
      });

      if (flowStages.length > 0) {
        return res.status(409).json({
          error: "Há fluxos utilizando esta etapa",
          message: `Há ${flowStages.length} fluxos que dependem desta etapa.`,
        });
      }


      const stage = await Stage.findByPk(idStage);

      if (!stage) {
        return res.status(401).json({ error: "Essa etapa não existe!" });
      } else {
        await stage.destroy();
        return res.json(stage);
      }
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
}

export default new StageController();
