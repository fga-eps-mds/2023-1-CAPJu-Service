import Flow from '../models/Flow.js';
import Stage from '../models/Stage.js';
import FlowStage from '../models/FlowStage.js';
import User from '../models/User.js';
import FlowUser from '../models/FlowUser.js';
import { QueryTypes } from 'sequelize';
import Database from '../database/index.js';

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

    async getByIdWithSequence(req, res) {
        const { idFlow } = req.params;

        const flow = await Flow.findByPk(idFlow);
        if (!flow) {
            return res
                .status(401)
                .json({ error: 'Esse fluxo não existe' });
        }

        const flowStages = await FlowStage.findAll({
            where: {
                idFlow
            },
            order: [
                ['order', 'ASC']
            ]
        });

        if (flowStages.length === 0) {
            return res.status(401).json({ error: 'Este fluxo não tem sequências' });
        }

        const orderedStages = flowStages.map((flowStage) => flowStage.idStage);
        console.log('orderedStages = ', orderedStages);

        let sequences = [];

        for (let i = 0; i < orderedStages.length - 1; i++) {
            sequences.push([orderedStages[i], orderedStages[i + 1]]);
        }

        return res.status(200).json({
            idFlow: flow.idFlow,
            name: flow.name,
            idUnit: flow.idUnit,
            sequences: sequences
        });
    }

    async getFlowStages(req, res) {
        const flowStages = await FlowStage.findAll();

        if (!flowStages) {
            return res.status(401).json({ error: 'Não há fluxos ligados a etapas' });
        }

        return res.status(200).json(flowStages);
    }

    async getUsersToNotify(req, res) {
        const { idFlow } = req.params;

        try {
            const result = await Database.connection.query(
                "SELECT \
                \"flowUser\".\"idFlow\", \"flowUser\".cpf, users.\"fullName\", users.email, users.\"idUnit\" \
                FROM \"flowUser\" \
                JOIN users ON \"flowUser\".cpf = users.cpf \
                WHERE \"flowUser\".\"idFlow\" = ?",
                {
                    replacements: [idFlow],
                    type: QueryTypes.SELECT
                }
            );

            console.log('result = ', result);

            res.status(200).json({usersToNotify: result});
        } catch(error) {
            console.log(error);
            res.status(500).json({error: "Impossível obter usuários que devem ser notificados no fluxo" });
        }
    }

    async store(req, res) {
        const { name, idUnit, idStages, idUsersToNotify } = req.body;
        try {

            for (const idUser of idUsersToNotify) {
                const user = await User.findByPk(idUser);

                if (!user) {
                    return res
                    .status(401)
                    .json({ error: `Usuário '${idUser}' não existe` });
                }
            }

            if (!(idStages.length >= 2)) {
                return res
                    .status(401)
                    .json({ error: 'Necessário pelo menos duas etapas!' });

            } else {
                const flow = await Flow.create({ name, idUnit });
                const idFlow  = flow.idFlow;

                for (const idStage of idStages) {
                    const foundStage = await Stage.findByPk(idStage);

                    if (foundStage) {
                        const flowStageWithLastOrder = await FlowStage.findAll({
                            where: {
                                idFlow: idFlow
                            },
                            order: [
                                ['order', 'DESC']
                            ],
                            limit: 1
                        });

                        let order = 0
                        if (flowStageWithLastOrder.length != 0) {
                            order = flowStageWithLastOrder[0].order + 1;
                        }

                        const flowStage = await FlowStage.create({
                            idStage: foundStage.idStage,
                            idFlow,
                            order
                        });
                    } else {
                        await flow.destroy();
                        return res
                            .status(401)
                            .json({ error: 'As etapas precisam ser válidas' });
                    }
                }

                for (const idUser of idUsersToNotify) {
                    const flowUser = await FlowUser.create({
                        cpf: idUser,
                        idFlow
                    });
                }

                return res.status(200).json({
                    idFlow: idFlow,
                    name: flow.name,
                    idUnit: idUnit,
                    idStages: idStages,
                    usersToNotify: idUsersToNotify
                });
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({error: "Impossível criar fluxo"});
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
        const { idFlow } = req.params;

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

    async deleteFlowStage(req, res) {
        const {idFlow, idStage} = req.params;

        const affectedRows = await FlowStage.destroy({
            where: {
                idFlow,
                idStage
            }
        });

        if (affectedRows === 0) {
            return res.status(401).json({ error: `Não há relacionameto entre o fluxo '${idFlow}' e a etapa '${idStage}'` });
        }

        console.log('affectedRows', affectedRows);

        return res.status(200).json({ message: `Desassociação entre fluxo '${idFlow}' e etapa '${idStage}' concluída` });
    }
}

export default new FlowController();
