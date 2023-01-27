import User from '../models/User.js';
import jwt from "jsonwebtoken";

const cpfFilter = (cpf) => cpf.replace(/[^0-9]/g, '');

const generateToken = (id) => {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: "3d",
        });
};
class UserController {
    async index(req, res) {
        const users = await User.findAll();

        if (!users) {
            return res
              .status(401)
              .json({ error: 'Não há usuários cadastrados' });
          } else {
              return res.json({users: users});
          }
    }

    async login(req, res) {
        try {
            const { cpf, password } = req.body;
            // Check for user cpf
            const user = await User.findByPk(cpfFilter(cpf));
            if (!user) {
                return res.status(401).json({
                    error: "Usuário inexistente",
                    message: "Usuário inexistente"
                });
            }
            if (user.password === password) {
                let expiresIn = new Date();
                expiresIn.setDate(expiresIn.getDate() + 3);
                return res.status(200).json({
                    cpf: user.cpf,
                    fullName: user.fullName,
                    email: user.email,
                    idUnit: user.idUnit,
                    token: generateToken(user.cpf),
                    idRole: user.idRole,
                    expiresIn,
                });
                return res.status(200).json(user);
            } else {
		        return res.status(401).json({
                    error: "Impossível autenticar",
                    message: "Senha ou usuário incorretos"
                });
	        }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error, message: "erro inesperado" });
        }
    }

    async getById(req, res) {
        const { cpf } = req.body;

        const user = await User.findByPk(cpf);

        if (!user) {
            return res
              .status(401)
              .json({ error: 'Usuário não existe' });
          } else {
              return res.json(user);
          }
    }

    async getByIdParam(req, res) {
        const cpf = req.params.id;
        const user = await User.findByPk(cpf);

        if (!user) {
            return res
              .status(401)
              .json({ error: 'Usuário não existe' });
          } else {
              return res.json(user);
          }
    }
  async allUser(req, res) {
    try {
      let accepted, user;
      if (req.query.accepted) {
        //accepted = req.query.accepted === true;
        accepted = req.query.accepted;
        user = await User.findAll({where: { accepted: accepted }});
        return res.status(200).json({
            user: user
          });
      } else {
          user = await User.findAll();
          return res.status(200).json({
            user: user
          });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }

    async store(req, res ) {
        const { fullName, cpf, email, password, idUnit, idRole } = req.body;

        try {
            const user = await User.create({
                fullName,
                cpf: cpfFilter(cpf),
                email,
                password,
                accepted: false,
                idUnit,
                idRole
            });
            return res.json(user);
        } catch(error) {
            console.log(error);
            return res.status(error).json(error);
        }
    }

    async update(req, res) {
        const { fullName, cpf, email } = req.body;

        const user = await User.findByPk(cpf);

        if (!user) {
            return res
              .status(401)
              .json({ error: 'Usuário não existe!' });
          } else {

            user.set({ fullName, email });

              await user.save();

              return res.json(user);
          }
      }

    async updateUser(req, res) {
        try {
            const cpf = req.params.id;
            const user = await User.findByPk(cpf);
            const newEmail = req.body.email;

            if (!user) {
                return res.status(401).json({
                    error: "Usuário não existe"
                });
            } else {
                user.set({email: newEmail});
                await user.save();
                return res.status(200).json(user);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Usuário não atualizado!" });
        }
    }

	async updateRole(req, res) {
        try {
            const {idRole, cpf} = req.body;
            const user = await User.findByPk(cpf);

            if (!user) {
                return res.status(401).json({
                    error: "Usuário não existe"
                });
            } else {
                user.set({idRole: idRole});
                await user.save();
                return res.status(200).json(user);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Usuário não atualizado!" });
        }
    }

    async editPassword(req, res) {
        try {
            const cpf = req.params.id;
            const { oldPassword, newPassword } = req.body;
            const user = await User.findByPk(cpf);
            if (!user) {
                return res
                .status(401)
                .json({ message: "Nenhum usuário foi encontrado" });
            }

            if (oldPassword === user.password) {
                user.set({password: newPassword});
                await user.save();
                return res
                .status(200)
                .json({ message: "Usuário atualizado com sucesso!" });
            } else {
                return res.status(400).json({ message: "Senha inválida!" });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Erro a atualizar usuário " });
        }
    }

      async delete(req, res) {
        const { cpf } = req.body;
        const user = await User.findByPk(cpf);

        if (!user) {
            return res
              .status(401)
              .json({ error: 'Usuário não existe!' });
          } else {
              await user.destroy();
              return res.status(200).json(user);
          }
      }
    async deleteByParam(req, res) {
        const cpf = req.params.id;
        const user = await User.findByPk(cpf);

        if (!user) {
            return res
              .status(401)
              .json({ error: 'Usuário não existe!' });
          } else {
              await user.destroy();
              return res.status(200).json(user);
          }
      }

    async acceptRequest(req, res) {
        try {
            const cpf = req.params.id;
            const user = await User.findByPk(cpf);

            if (!user) {
                res.status(401).json({error: "Usuário não existe"});
            } else {
                user.set({accepted: true});
                await user.save();
                return res.status(200).send(user);
            }
        } catch (error) {
            console.log("error", error);
            return res.status(500);
        }
    }

    async deleteRequest(req, res) {
        try {
            const cpf = req.params.id;
            const user = await User.findByPk(cpf);

            if (!user) {
                res.status(401).json({error: "Usuário não existe"});
            } else {
                await user.destroy();
                return res.status(200).send(user);
            }
        } catch (error) {
            console.log("error", error);
            return res.status(500).json(error);
        }
    }
}

export default new UserController();
