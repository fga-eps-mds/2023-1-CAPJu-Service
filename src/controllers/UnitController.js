import Unit from '../models/Unit.js';
import User from '../models/User.js';
import { ROLE } from '../schemas/role.js';

class UnitController {

    async index(req, res) {
        const units = await Unit.findAll();

        if (!units) {
            return res
              .status(401)
              .json({ message: 'Não Existe unidades' });
          } else {
              return res.status(200).json(units);
          }
    }

    async store(req, res) {
        const { name } = req.body;
        try {
            const unit = await Unit.create({
                name,
            });
            return res.json(unit);
        } catch(error) {
            console.log(error);
            return res.status(500).json({
                error,
                message: "Erro ao criar unidade"
            });
        }
    }

    async update(req, res) {
        const { idUnit, name } = req.body;

        const unit = await Unit.findByPk(idUnit);

        if (!unit) {
            return res
              .status(404)
              .json({ message: 'Essa unidade não existe!' });
          } else {

            unit.set({ name });

              await unit.save();

              return res.status(200).json(unit);
          }
      }

      async delete(req, res) {
        const { idUnit } = req.body;

        const unit = await Unit.findByPk(idUnit);

        if (!unit) {
            return res
              .status(401)
              .json({ error: 'Essa unidade não existe!' });
          } else {
              await unit.destroy();
              return res.status(200).json(unit);
          }
      }

    async getAdminsByUnitId(req, res) {
        const idUnit = req.params.id;

        const users = await User.findAll({
            where: {
                idUnit: idUnit,
                idRole: 5
            }
        });

        if (!users) {
            return res.status(401).json(
                {error: "Não há administradores para essa unidade"}
            );
        } else {
            return res.status(200).json(users);
        }
    }

    async setUnitAdmin(req, res) {
        const {idUnit, cpf} = req.body;

        const user = await User.findOne(
            {
                where:
                {
                    cpf: cpf,
                    idUnit: idUnit,
                    accepted: true
                }
            }
        );

        if (!user) {
            return res.status(404).json(
                {
                    message: "Usuário aceito não existe nesta unidade"
                }
            );
        } else {
            try {
                user.set({idRole: ROLE.ADMINISTRADOR});
                await user.save();
                const userNoPassword = {
                  cpf: user.cpf,
                  fullName: user.fullName,
                  email: user.email,
                  accepted: user.accepted,
                  idUnit: user.idUnit,
                  idRole: user.idRole
                };
                return res.status(200).json(userNoPassword);
            } catch (error) {
                console.log(error);
                return res.status(500).json(
                    {
                        error,
                        message: "Erro ao configurar usuário como administrador"
                    }
                );
            }
        }
    }

    async removeUnitAdmin(req, res) {
        const {idUnit, cpf} = req.body;
        const user = await User.findOne(
            {
                where:
                {
                    cpf: cpf,
                    idUnit: idUnit
                }
            }
        );
        if (!user) {
            return res.status(401).json(
                {
                    error: "Usuário não existe nesta unidade"
                }
            );
        } else {
            try {
                user.set({idRole: 2});
                await user.save();
                return res.status(200).json(user);
            } catch (error) {
                console.log(error);
                return res.status(500).json(
                    {
                        error: "Erro ao configurar usuário como administrador"
                    }
                );
            }
        }
    }
}

export default new UnitController();
