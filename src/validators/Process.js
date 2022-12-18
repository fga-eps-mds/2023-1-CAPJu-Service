import Joi from "joi";

export const ProcessValidator = Joi.object({
  registro: Joi.string().required(),
  apelido: Joi.string().allow(null, ""),
  etapaAtual: Joi.string().required(),
  arquivado: Joi.boolean().required(),
  fluxoId: Joi.string().required(),
});

export const ProcessEditValidator = Joi.object({
  registro: Joi.string().allow(null, ""),
  apelido: Joi.string().allow(null, ""),
  arquivado: Joi.boolean().allow(null, ""),
  fluxoId: Joi.string().allow(null, ""),
});

export const ProcessNewObservationValidator = Joi.object({
  processId: Joi.string().required(),
  originStage: Joi.string().required(),
  destinationStage: Joi.string().required(),
  observation: Joi.string().allow(null, ""),
});

export const NextStageValidator = Joi.object({
  processId: Joi.string().required(),
  stageIdTo: Joi.string().required(),
  stageIdFrom: Joi.string().required(),
  observation: Joi.string().allow(null, ""),
});

export const updateObservation = Joi.object({
  processId: Joi.string().required(),
  stageIdFrom: Joi.string().required(),
  observation: Joi.string().allow(null, ""),
});