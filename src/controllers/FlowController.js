import Flow from '../models/Flow.js';

class FlowController {

    async index(req, res) {
        const flows = await Flow.findAll();

        if (!flows) {
            return res
              .status(401)
              .json({ error: 'Não Existem fluxos' });
          } else {
              return res.json(flows);
          }
    }

    async getById(req, res) {
        const idFlow = req.params.id;

        const flow = await Flow.findByPk(idFlow);

        if (!flow) {
            return res
              .status(401)
              .json({ error: 'Esse fluxo não existe' });
          } else {
              return res.json(flow);
          }
    }

    async store(req, res) {
        const { name, idUnit } = req.body;
        try {
            const flow = await Flow.create({
                name,
                idUnit
            });
            return res.json(flow);
        } catch(error) {
            console.log(error);
            return res.status(error).json(error);
        }
    }

    async update(req, res) {
        const { idFlow, name } = req.body;

        const flow = await Flow.findByPk(idFlow);

        if (!flow) {
            return res
              .status(401)
              .json({ error: 'Esse fluxo não existe!' });
          } else {

            flow.set({ name });

              await flow.save();

              return res.json(flow);
          }
      }

      async delete(req, res) {
        const idFlow = req.params.id;

        const flow = await Flow.findByPk(idFlow);

        if (!flow) {
            return res
              .status(401)
              .json({ error: 'Esse fluxo não existe!' });
          } else {
              await flow.destroy();
              return res.json(flow);
          }
      }
}

export default new FlowController();
