import Role from '../models/Role.js';

class RoleController {

    // async index(req, res) {
    //     const { user_id } = req.params;

    //     const user = await User.findByPk(user_id, {
    //         include: { association: 'adresses' }
    //     });

    //     return res.json(user.adresses);
    // }

    async store(req, res ) {
        const { name } = req.body;
        const { accessLevel } = req.body;

        console.log('Caiu aqui nesse caralho = ' + name);
        
        try {
            const role = await Role.create({
                name,
                accessLevel
            });
            return res.json(role);
        } catch(error) {
            console.log(error);
            return res.status(error).json(error);
        }
        

    }
}

export default new RoleController();