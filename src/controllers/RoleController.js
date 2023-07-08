import Role from "../models/Role.js";

class RoleController {
  async index(req, res) {
    const role = await Role.findAll();

    if (!role) {
      return res.status(204).json({ error: "Não Existe cargo" });
    } else {
      return res.json(role);
    }
  }

  async getById(req, res) {
    const idRole = req.params.id;

    const role = await Role.findByPk(idRole);

    if (!role) {
      return res.status(204).json({ error: "Esse cargo não existe!" });
    } else {
      return res.json(role);
    }
  }

  async updateRoleName(req, res) {
    const { name, idRole } = req.body;

    const role = await Role.findByPk(idRole);

    if (!role || role === null) {
      return res.status(204).json({ error: "Esse cargo não existe!" });
    } else {
      role.set({ name });

      await role.save();

      return res.json(role);
    }
  }

  async updateRoleAllowedActions(req, res) {
    const { allowedActions } = req.body;
    const { idRole } = req.params;

    const role = await Role.findByPk(idRole);

    if (!role || role === null) {
      return res.status(204).json({ error: "Esse cargo não existe!" });
    } else {
      role.set({ allowedActions });

      await role.save();

      return res.json(role);
    }
  }

  async delete(req, res) {
    const { idRole } = req.body;

    const role = await Role.findByPk(idRole);

    if (!role) {
      return res.status(204).json({ error: "Esse cargo não existe!" });
    } else {
      await role.destroy();
      return res.json(role);
    }
  }

  async store(req, res) {
    const { name } = req.body;
    const { accessLevel } = req.body;

    try {
      const role = await Role.create({
        name,
        accessLevel,
      });
      return res.json(role);
    } catch (error) {
      return res.status(408).json(error);
    }
  }
}

export default new RoleController();
