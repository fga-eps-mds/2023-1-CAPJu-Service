import Unit from '../models/Unit.js';

class UnitController {

    async index(req, res) {
        const units = await Unit.findAll();

        if (!units) {
            return res
              .status(401)
              .json({ error: 'Não Existe unidades' });
          } else {
              return res.json(units);
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
}

export default new UnitController();