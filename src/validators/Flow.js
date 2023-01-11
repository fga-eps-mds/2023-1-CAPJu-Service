import Joi from "joi";

export const FlowValidator = Joi.object({
  name: Joi.string().required(),
  stages: Joi.array().items(Joi.string()).required(),
  sequences: Joi.array()
    .items(
      Joi.object({
        from: Joi.string(),
        to: Joi.string(),
      })
    )
    .required(),
  users: Joi.array().items(Joi.string()).required(),
});

export const FlowEditValidator = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().allow(null, ""),
  stages: Joi.array().items(Joi.string()).allow(null),
  sequences: Joi.array()
    .items(
      Joi.object({
        from: Joi.string(),
        to: Joi.string(),
      })
    )
    .allow(null),
  users: Joi.array().items(Joi.string()).required(),
  deleted: Joi.bool().allow(null),
  updatedAt: Joi.string().allow(null,'')
});
