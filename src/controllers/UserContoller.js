import User from '../models/User.js';

class UserController {

    // async index(req, res) {
    //     const { user_id } = req.params;

    //     const user = await User.findByPk(user_id, {
    //         include: { association: 'adresses' }
    //     });

    //     return res.json(user.adresses);
    // }

    async store(req, res ) {
        const { fullName, cpf, email, password, idUnit, idRole } = req.body;

        console.log('Caiu aqui nesse caralho = ' + fullName);
        
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
}

export default new UserController();