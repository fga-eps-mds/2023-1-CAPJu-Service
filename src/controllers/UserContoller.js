import User from '../models/User.js';
import jwt from "jsonwebtoken";

const cpfFilter = (cpf) => cpf.replace(/[^0-9]/g, '');

const generateToken = (id) => {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: "3d",
        });
};
class UserController {
  /*async index(req, res) {
    try {
      const usersRaw = await User.findAll();
      const users = usersRaw.map((user) => {
        return {
          cpf: user.cpf,
          fullName: user.fullName,
          email: user.email,
          accepted: user.accepted,
          idUnit: user.idUnit,
          idRole: user.idRole
        }
      });

      if (!users) {
        return res
        .status(500)
        .json({
          message: 'Erro ao buscar usuários'
        });
      } else {
        return res.status(200).json(users);
      }
    } catch(error) {
      console.log(error);
      return res.status(500).json({
        error,
        message: "Erro ao buscar usuários"
      });
    }
  }*/

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

    /*async getById(req, res) {
        const { cpf } = req.body;

      try {
        const userRaw = await User.findByPk(cpf);
        const user = {
          cpf: userRaw.cpf,
          fullName: userRaw.fullName,
          email: userRaw.email,
          accepted: userRaw.accepted,
          idUnit: userRaw.idUnit,
          idRole: userRaw.idRole
        };

        if (!user) {
            return res
              .status(404)
              .json({ error: 'Usuário não existe' });
          } else {
              return res.status(200).json(user);
          }
      } catch (error) {
        return res.status(500).json({
          error,
          message: "Erro ao buscar usuário"});
      }
    }*/

    async getByIdParam(req, res) {
        const cpf = req.params.id;
      try {
        const userRaw = await User.findByPk(cpf);

      const user = {
          cpf: userRaw.cpf,
          fullName: userRaw.fullName,
          email: userRaw.email,
          accepted: userRaw.accepted,
          idUnit: userRaw.idUnit,
          idRole: userRaw.idRole
        };

        if (!user) {
            return res
              .status(404)
              .json({ error: 'Usuário não existe' });
          } else {
              return res.json(user);
          }
      } catch(error) {
        return res.status(500).json({
          error,
          message: "Erro ao buscar usuário"});
      }
    }

  async allUser(req, res) {
    try {
      if (req.query.accepted) {
        const accepted = req.query.accepted;
        let users = await User.findAll({where: { accepted: accepted }});
        users.map((user) => {
          return {
            cpf: user.cpf,
            fullName: user.fullName,
            email: user.email,
            accepted: user.accepted,
            idUnit: user.idUnit,
            idRole: user.idRole
          };
        });
        return res.status(200).json(users);
      } else {
          let users = await User.findAll();
          return res.status(200).json(users);
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error,
        message: "Erro ao listar usuários aceitos ou não"
      });
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
            return res.status(500).json({error, message: "Erro ao criar usuário"});
        }
    }

    /*async update(req, res) {
        const { fullName, cpf, email } = req.body;

        const user = await User.findByPk(cpf);

        if (!user) {
            return res
              .status(401)
              .json({ error: 'Usuário não existe!' });
          } else {

            user.set({ fullName, email });

              await user.save();

              return res.status(200).json({
                message: "Email atualizado"
              });
          }
      }*/

    async updateUser(req, res) {
        try {
            const cpf = req.params.id;
            const user = await User.findByPk(cpf);
            const newEmail = req.body.email;

            if (!user) {
                return res.status(404).json({
                    error: "Usuário não existe"
                });
            } else {
                user.set({email: newEmail});
                await user.save();
                return res.status(200).json({
                  message: "Email atualizado com sucesso"
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
              error,
              message: "Impossível atualizar email"
            });
        }
    }

	async updateRole(req, res) {
        try {
            const {idRole, cpf} = req.body;
            const user = await User.findByPk(cpf);

            if (!user) {
                return res.status(404).json({
                    error: "Usuário não existe"
                });
            } else {
                user.set({idRole: idRole});
                await user.save();
                return res.status(200).json({
                  message: "Papel atualizado com sucesso"
                });
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
                .status(404)
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
            return res.status(500).json({
              error,
              message: "Erro a atualizar usuário "
            });
        }
    }

      /*async delete(req, res) {
        const { cpf } = req.body;
        const user = await User.findByPk(cpf);

        if (!user) {
            return res
              .status(404)
              .json({ error: 'Usuário não existe!' });
          } else {
              await user.destroy();
              return res.status(200).json({
                message: "Usuário apagado com sucesso"
              });
          }
      }*/
    async deleteByParam(req, res) {
        const cpf = req.params.id;
      try {
        const user = await User.findByPk(cpf);

        if (!user) {
            return res
              .status(404)
              .json({ error: 'Usuário não existe!' });
          } else {
              await user.destroy();
              return res.status(200).json({
                message: "Usuário apagado com sucesso"
              });
          }
      } catch (error) {
        return res.status(500).json({
          error,
          message: "Erro ao apagar usuário"
        });
      }
      }

    async acceptRequest(req, res) {
        try {
            const cpf = req.params.id;
            const user = await User.findByPk(cpf);

            if (!user) {
                res.status(404).json({error: "Usuário não existe"});
            } else {
                user.set({accepted: true});
                await user.save();
                return res.status(200).json({
                  message: "Usuário aceito com sucesso"
                });
            }
        } catch (error) {
            console.log("error", error);
            return res.status(500).json({
              error,
              message: "Falha ao aceitar usuário"
            });
        }
    }

    async deleteRequest(req, res) {
        try {
            const cpf = req.params.id;
            const user = await User.findByPk(cpf);

            if (!user) {
                res.status(404).json({error: "Usuário não existe"});
            } else {
                await user.destroy();
                return res.status(200).json({
                  message: "Usuário não aceito foi excluído"
                });
            }
        } catch (error) {
            console.log("error", error);
            return res.status(500).json({
              error,
              message: "Erro ao negar pedido do usuário"
            });
        }
    }
}

export default new UserController();
