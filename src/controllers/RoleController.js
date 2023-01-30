import Role from '../models/Role.js';

class RoleController {
    
    async index(req, res) {
        const role = await Role.findAll();
    
        if (!role) {
            return res
              .status(401)
              .json({ error: 'Não Existe cargo' });
          } else {
              return res.json(role);
          }
    }
    
    async getById(req, res) {
        const idRole = req.params.id;
    
        const role = await Role.findByPk(idRole);
    
        if (!role) {
            return res
              .status(401)
              .json({ error: 'Esse cargo não existe!' });
          } else {
              return res.json(role);
          }
    }
    
    async update(req, res) {
        const { name, idRole } = req.body; 
    
        const role = await Role.findByPk(idRole);
    
        if (!role) {
            return res
              .status(401)
              .json({ error: 'Esse cargo não existe!' });
          } else {
            
            role.set({ name });
            
              await role.save();
    
              return res.json(role);
          } 
      }
    
      async delete(req, res) {
        const { idRole } = req.body; 
    
        const role = await Role.findByPk(idRole);
    
        if (!role) {
            return res
              .status(401)
              .json({ error: 'Esse cargo não existe!' });
          } else {
              await role.destroy();
              return res.json(role);
          }
      }
    

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