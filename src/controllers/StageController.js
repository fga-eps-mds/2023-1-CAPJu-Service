import Stage from "../models/Stage.js";
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
    const idStage = req.params.id;

    const stage = await Stage.findByPk(idStage);

    if (!stage) {
      return res.status(401).json({ error: "Esse fluxo não existe!" });
    } else {
      await stage.destroy();
      return res.json(stage);
    }
  }
}

export default new StageController();
