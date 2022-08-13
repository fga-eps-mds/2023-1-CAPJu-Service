import Joi from "joi";

export const ProcessValidator = Joi.object({
  registro: Joi.string().required(),
  apelido: Joi.string().allow(null, ""),
  etapaAtual: Joi.string().required(),
  arquivado: Joi.boolean().required(),
  etapas: Joi.array().items(Joi.object({
    etapa: Joi.string(),
    duracao: Joi.number(),
    observacoes: Joi.string().allow(null, "")
  })).allow(null),
  fluxoId: Joi.string().required()
});

export const ProcessEditValidator = Joi.object({
  registro: Joi.string().allow(null, ""),
  apelido: Joi.string().allow(null, ""),
  arquivado: Joi.boolean().allow(null, ""),
  fluxoId: Joi.string().allow(null, "")
});

export const NextStageValidator = Joi.object({
  processId: Joi.string().required(),
  stageId: Joi.string().required()
})
