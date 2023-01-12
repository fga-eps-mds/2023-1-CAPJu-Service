import Flow from '../models/Flow.js';
import Stage from '../models/Stage.js';
import FlowStage from '../models/FlowStage.js';

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
        const { name, idUnit, stages } = req.body;
        try {
            console.log("stages length = ", stages.length);
            const flow = await Flow.create({ name, idUnit });
            const idFlow  = flow.idFlow;
            

            if (!(stages.length >= 2)) {
                await flow.destroy();
                return res
                    .status(401)
                    .json({ error: 'Necessário pelo menos duas etapas!' });

            } else {
                console.log('==========================================');
                console.log('idFlow = ', idFlow);
                console.log('==========================================');

                stages.forEach(async (stage) => {
                    const findedStage = await Stage.findByPk(stage.idStage);
                    if (stage.idStage && findedStage) {
                        console.log('idFlow = ', idFlow);
                        const { idStage, order } = stage
                        console.log('==========================================');
                        console.log('order = ', order);
                        console.log('==========================================');
                        console.log('idStage = ', idStage);
                        
                        const flowStage = await FlowStage.create({
                            idStage,
                            idFlow,
                            order
                        });
                    } else {
                        await flow.destroy();
                        return res
                            .status(401)
                            .json({ error: 'As etapas precisam ser válidas' });
                    }


                });

                return res.json(flow);
            }

        } catch (error) {
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
