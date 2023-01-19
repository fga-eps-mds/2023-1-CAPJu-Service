import User from '../models/User.js';

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
            const user = await User.findByPk(cpf);
            if (!user) {
                return res.status(401).json({ message: "o usuário não existe" });
            }
            if (user.password === password) {
                return res.status(200).json(user);
            }
        } catch (error) {
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

    async store(req, res ) {
        const { fullName, cpf, email, password, idUnit, idRole } = req.body;

        try {
            const user = await User.create({
                fullName,
                cpf,
                email,
                password,
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
