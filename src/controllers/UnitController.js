import Unit from '../models/Unit.js';
import User from '../models/User.js';

class UnitController {

    async index(req, res) {
        const units = await Unit.findAll();

        if (!units) {
            return res
              .status(401)
              .json({ error: 'Não Existe unidades' });
          } else {
              return res.json({units: units});
          }
    }

    async getById(req, res) {
        const idUnit = req.params.id;

        const unit = await Unit.findByPk(idUnit);

        if (!unit) {
            return res
              .status(401)
              .json({ error: 'Essa unidade não existe' });
          } else {
              return res.json(unit);
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
            return res.status(error).json(error);
        }
    }

    async update(req, res) {
        const {  idUnit, name } = req.body; 
    
        const unit = await Unit.findByPk(idUnit);
    
        if (!unit) {
            return res
              .status(401)
              .json({ error: 'Essa unidade não existe!' });
          } else {
            
            unit.set({ name, idUnit });
            
              await unit.save();
    
              return res.json(unit);
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
              return res.json(unit);
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
        console.log(users);

        if (!users) {
            return res.status(401).json(
                {error: "Não há administradores para essa unidade"}
            );
        } else {
            return res.status(200).json({admins: users});
        }
    }

    async setUnitAdmin(req, res) {
        // TODO
    }
}

export default new UnitController();
