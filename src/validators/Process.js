import Joi from "joi";

export const ProcessValidator = Joi.object({
  record: Joi.string().required(),
  nickname: Joi.string().allow(null, ""),
  etapaAtual: Joi.string().required(),
  finalised: Joi.boolean().required(),
  idFlow: Joi.string().required(),
});

export const ProcessEditValidator = Joi.object({
  record: Joi.string().allow(null, ""),
  nickname: Joi.string().allow(null, ""),
  finalised: Joi.boolean().allow(null, ""),
  idFlow: Joi.string().allow(null, ""),
});

export const ProcessNewObservationValidator = Joi.object({
  processId: Joi.string().required(),
  originStage: Joi.string().required(),
  destinationStage: Joi.number().required(),
  commentary: Joi.string().allow(null, ""),
});

export const NextStageValidator = Joi.object({
  record: Joi.string().required(),
  stageIdTo: Joi.number().required(),
  stageIdFrom: Joi.number().required(),
  commentary: Joi.string().allow(null, ""),
});
