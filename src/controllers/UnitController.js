import Unit from '../models/Unit.js';

class UnitController {

    async index(req, res) {
        const { user_id } = req.params;

        const user = await User.findByPk(user_id, {
            include: { association: 'adresses' }
        });

        return res.json(user.adresses);
    }

    async store(req, res ) {
        const { name } = req.body;
        console.log('Caiu aqui nesse caralho = ' + name);
        // const unit = await Unit.findByPk(user_id);
        
        // if(!user) {
        //     return res.status(400).json({ error: 'User not found' });
        // }
        try {
            const unit = await Unit.create({
                name,
            });
            return res.json(unit);
        } catch(error) {
            console.log(error);
            return res.status(error).json(error);
        }
        

    }
}

export default new UnitController();