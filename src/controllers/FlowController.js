import Flow from '../models/Flow.js';
import Stage from '../models/Stage.js';
import FlowStage from '../models/FlowStage.js';
import User from '../models/User.js';
import FlowUser from '../models/FlowUser.js';
import { QueryTypes } from 'sequelize';
import Database from '../database/index.js';

async function getMailContents() {
    try {
        const mailContents = await Database.connection.query(
            "select \
            f.\"idFlow\" as id_flow, \
            f.\"name\" as flow, \
            p.record as process_record, \
            p.nickname as process, \
            s.\"idStage\" as id_stage, \
            s.\"name\" as stage, \
            p.\"effectiveDate\" as start_date, \
            s.duration as stage_duration, \
            u.email as email, \
            extract(day from (current_timestamp - p.\"effectiveDate\")) - cast(s.duration as integer) as delay_days \
            from \
                users u \
            join \"flowUser\" fu on \
                fu.cpf = u.cpf \
            join \"flowProcess\" fp on \
                fp.\"idFlow\" = fu.\"idFlow\" \
            join process p on \
                p.record = fp.record \
            join stage s on \
                s.\"idStage\" = p.\"idStage\" \
            join flow f on \
                f.\"idFlow\" = fp.\"idFlow\" \
            where \
                extract(day from (current_timestamp - p.\"effectiveDate\")) > cast(s.duration as integer)",
            {
                type: QueryTypes.SELECT
            }
        );
        return mailContents;
    } catch(error) {
        console.log(error);
        return {
            error,
            message: "Erro ao obter conteúdo dos emails"
        };
    }
}
class FlowController {

    async index(req, res) {
        const flows = await Flow.findAll();

        if (!flows) {
            return res
                .status(401)
                .json({ error: 'Não Existem fluxos' });
        } else {
            return res.json({Flows: flows});
        }
    }

    async getMailContentsEndpoint(req, res) {
        const contents = await getMailContents();
        if (contents.error) {
            return res.status(500).json(contents);
        } else {
            return res.status(200).json(contents);
        }
    }

    async indexForFrontend(req, res) {
        try {
            const flows = await Flow.findAll();
            let flowsWithSequences = [];
            for (const flow of flows) {
                const flowStages = await FlowStage.findAll({
                    where: {
                        idFlow: flow.idFlow
                    }
                });

                let sequences = [];
                let stages = [];

                if (flowStages.length > 0) {
                    for (let i = 0; i < flowStages.length; i++) {
                        sequences.push({from: flowStages[i].idStageA, commentary: flowStages[i].commentary, to: flowStages[i].idStageB});
                        if (!stages.includes(flowStages[i].idStageA)) {
                            stages.push(flowStages[i].idStageA);
                        }
                        if (!stages.includes(flowStages[i].idStageB)) {
                            stages.push(flowStages[i].idStageB);
                        }
                    }
                }

                const flowSequence = {
                    idFlow: flow.idFlow,
                    name: flow.name,
                    idUnit: flow.idUnit,
                    stages,
                    sequences,
                };

                console.log('flowSequence', flowSequence);

                flowsWithSequences.push(flowSequence);
            };

            console.log('flows', flows);
            console.log('flowsWithSequences', flowsWithSequences);

            return res.status(200).json({ Flows: flowsWithSequences });
        } catch(error) {
            console.log(error);
            return res.status(500).json({error: "Impossível obter fluxos"});
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
        });

        if (flowStages.length === 0) {
            return res.status(401).json({ error: 'Este fluxo não tem sequências' });
        }

        let sequences = [];

        for (let i = 0; i < flowStages.length; i++) {
            sequences.push({from: flowStages[i].idStageA, to: flowStages[i].idStageB});
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

            res.status(200).json({usersToNotify: result});
        } catch(error) {
            console.log(error);
            res.status(500).json({error: "Impossível obter usuários que devem ser notificados no fluxo" });
        }
    }

    async store(req, res) {
        const { name, idUnit, sequences, idUsersToNotify } = req.body;
        try {

            for (const idUser of idUsersToNotify) {
                const user = await User.findByPk(idUser);

                if (!user) {
                    return res
                    .status(401)
                    .json({ error: `Usuário '${idUser}' não existe` });
                }
            }

            if (sequences.length < 1) {
                return res
                    .status(401)
                    .json({ error: 'Necessário pelo menos duas etapas!' });

            } else {
                for (const sequence of sequences) {
                    const idStageA = sequence.from;
                    const idStageB = sequence.to;
                    const {commentary} = sequence;

                    if (idStageA == idStageB) {
                        return res.status(401).json({error: "Sequências devem ter início e fim diferentes"});
                    }

                    const stageA = await Stage.findByPk(idStageA);
                    if (!stageA) {
                        return res.status(401).json({error: `Não existe a etapa com identificador '${idStageA}'`});
                    }
                    const stageB = await Stage.findByPk(idStageB);
                    if (!stageB) {
                        return res.status(401).json({error: `Não existe a etapa com identificador '${idStageB}'`});
                    }
                }
                const flow = await Flow.create({ name, idUnit });
                const idFlow  = flow.idFlow;

                for (const sequence of sequences) {
                    const flowStage = await FlowStage.create({
                        idFlow,
                        idStageA: sequence.to,
                        idStageB: sequence.from,
                        commentary: sequence.commentary
                    });
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
                    sequences,
                    usersToNotify: idUsersToNotify
                });
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({error: "Impossível criar fluxo"});
        }
    }

    async update(req, res) {
        const { name, idFlow, sequences, idUsersToNotify } = req.body;


        try {
            const flow = await Flow.findByPk(idFlow);

            if (!flow) {
                return res
                    .status(401)
                    .json({ error: 'Esse fluxo não existe!' });
            } else {

                flow.set({ name });

                await flow.save();
                const flowStage = await FlowStage.destroy({
                    where: { idFlow: idFlow }
                });

                console.log('flowStage = ',flowStage);

                const flowUser = await FlowUser.destroy({
                    where: { idFlow: idFlow }
                });

                console.log('flowUser = ', flowUser)
                for (const idUser of idUsersToNotify) {
                    const user = await User.findByPk(idUser);
    
                    if (!user) {
                        return res
                        .status(401)
                        .json({ error: `Usuário '${idUser}' não existe` });
                    }
                }
    
                if (sequences.length < 1) {
                    return res
                        .status(401)
                        .json({ error: 'Necessário pelo menos duas etapas!' });
    
                } else {
                    for (const sequence of sequences) {
                        const idStageA = sequence.from;
                        const idStageB = sequence.to;
    
                        if (idStageA == idStageB) {
                            return res.status(401).json({error: "Sequências devem ter início e fim diferentes"});
                        }
    
                        const stageA = await Stage.findByPk(idStageA);
                        if (!stageA) {
                            return res.status(401).json({error: `Não existe a etapa com identificador '${idStageA}'`});
                        }
                        const stageB = await Stage.findByPk(idStageB);
                        if (!stageB) {
                            return res.status(401).json({error: `Não existe a etapa com identificador '${idStageB}'`});
                        }
                    }
                    const idFlow  = flow.idFlow;
    
                    for (const sequence of sequences) {
                        const flowStage = await FlowStage.create({
                            idFlow,
                            idStageA: sequence.to,
                            idStageB: sequence.from,
                            commentary: sequence.commentary
                        });
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
                        sequences,
                        usersToNotify: idUsersToNotify
                    });
                }
            }

        }  catch (error) {
            console.log(error);
            return res.status(500).json({error: "Impossível criar fluxo"});
        }

    }

    async delete(req, res) {
        try {
            const { idFlow } = req.params;
            await FlowStage.destroy({where: {idFlow}});
            const rows = await Flow.destroy({where: {idFlow}});
            if (rows > 0) {
                return res.status(200).json({message: "Apagado com sucesso"});
            } else {
                return res.status(404).json({message: "Fluxo não encontrado"});
            }
        } catch(error) {
            console.log(error);
            return res.status(500).json({error, message: "Impossível apagar"});
        }
    }

    async deleteFlowStage(req, res) {
        const {idFlow, idStageA, idStageB} = req.params;

        const affectedRows = await FlowStage.destroy({
            where: {
                idFlow,
                idStageA,
                idStageB
            }
        });

        if (affectedRows === 0) {
            return res.status(401).json({ error: `Não há relacionameto entre o fluxo '${idFlow}' e as etapas '${idStageA}' e '${idStageB}'` });
        }

        console.log('affectedRows', affectedRows);

        return res.status(200).json({ message: `Desassociação entre fluxo '${idFlow}' e etapas '${idStageA}' e '${idStageB}' concluída` });
    }
}

export default new FlowController();
