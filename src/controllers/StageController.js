import Stage from "../models/Stage.js";
import FlowStage from "../models/FlowStage.js";
import { Op } from "sequelize";
import { tokenToUser } from "../middleware/authMiddleware.js";
import { filterByName } from "../utils/filters.js";

class StageController {
  async index(req, res) {
    let where;
    const { idUnit, idRole } = await tokenToUser(req);
    const unitFilter = idRole === 5 ? {} : { idUnit };
    where = {
      ...filterByName(req),
      ...unitFilter,
    };

    const stages = await Stage.findAll({
      where,
      offset: req.query.offset,
      limit: req.query.limit,
    });
    const totalCount = await Stage.count({ where });
    const totalPages = Math.ceil(totalCount / parseInt(req.query.limit, 10));

    if (!stages || stages.length === 0) {
      return res.status(204).json([]);
    } else {
      return res.status(200).json({ stages: stages || [], totalPages });
    }
  }

  async getById(req, res) {
    const idStage = req.params.id;

    const stage = await Stage.findByPk(idStage);

    if (!stage) {
      return res.status(204).json({});
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

      return res.status(200).json(stage);
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async delete(req, res) {
    try {
      const idStage = req.params.id;

      const flowStages = await FlowStage.findAll({
        where: {
          [Op.or]: [{ idStageA: idStage }, { idStageB: idStage }],
        },
      });

      if (flowStages.length > 0) {
        return res.status(204).json({});
      }

      const stage = await Stage.findByPk(idStage);

      if (!stage) {
        return res.status(204).json({});
      } else {
        await stage.destroy();
        return res.status(200).json(stage);
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  }
}

export default new StageController();
