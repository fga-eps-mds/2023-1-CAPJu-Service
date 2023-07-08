import Role from "../models/Role.js";

class RoleController {
  async index(_req, res) {
    try {
      const role = await Role.findAll();

      if (!role) {
        return res.status(204).json({ message: "Não Existe cargo" });
      } else {
        return res.status(200).json(role);
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async getById(req, res) {
    const idRole = req.params.id;

    try {
      const role = await Role.findByPk(idRole);
      if (!role) {
        return res.status(204).json([]);
      } else {
        return res.status(200).json(role);
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async updateRoleName(req, res) {
    const { name, idRole } = req.body;

    try {
      const role = await Role.findByPk(idRole);
      if (!role || role === null) {
        return res.status(204).json([]);
      } else {
        role.set({ name });
        await role.save();
        return res.status(200).json(role);
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async updateRoleAllowedActions(req, res) {
    const { allowedActions } = req.body;
    const { idRole } = req.params;

    try {
      const role = await Role.findByPk(idRole);
      if (!role || role === null) {
        return res.status(204).json([]);
      } else {
        role.set({ allowedActions });
        await role.save();
        return res.status(200).json(role);
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async delete(req, res) {
    const { idRole } = req.body;

    try {
      const role = await Role.findByPk(idRole);
      if (!role) {
        return res.status(404);
      } else {
        await role.destroy();
        return res.status(200).json(role);
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  }

  async store(req, res) {
    const { name, accessLevel } = req.body;

    try {
      const role = await Role.create({
        name,
        accessLevel,
      });
      return res.status(200).json(role);
    } catch (error) {
      return res.status(500).json(error);
    }
  }
}

export default new RoleController();
