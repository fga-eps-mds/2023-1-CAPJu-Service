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
              return res.json(users);
          }
    }

    async login(req, res) {
        try {
            const { cpf, password } = req.body;
            // Check for user cpf
            const user = await User.findByPk(cpfFilter(cpf));
            if (!user) {
                return res.status(401).json({ message: "o usuário não existe" });
            }
            if (user.password === password) {
                let expiresIn = new Date();
                expiresIn.setDate(expiresIn.getDate() + 3);
                return res.status(200).json({
                    _id: user.cpf,
                    name: user.fullName,
                    email: user.email,
                    token: generateToken(user.cpf),
                    expiresIn,
                });
                return res.status(200).json(user);
            } else {
		    return res.status(401).json({message: "Senha ou usuário incorretos"});
	    }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "erro inesperado" });
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

  async allUser(req, res) {
    try {
      let accepted, user;
      console.log(req.query.accepted);
      if (req.query.accepted) {
        //accepted = req.query.accepted === true;
        accepted = req.query.accepted;
        user = await User.findAll({where: { accepted: accepted }});
        console.log(user);
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
                cpf,
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

      async delete(req, res) {
        const { cpf } = req.body;

        const user = await User.findByPk(cpf);

        if (!user) {
            return res
              .status(401)
              .json({ error: 'Usuário não existe!' });
          } else {
              await user.destroy();
              return res.json(user);
          }
      }
}

export default new UserController();
