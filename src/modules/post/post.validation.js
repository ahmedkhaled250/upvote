import joi from "joi";
export const createPost = {
  body: joi.object().required().keys({
    caption: joi.string(),
  }),
  headers: joi
    .object()
    .required()
    .keys({
      authorization: joi.string().required(),
    })
    .options({ allowUnknown: true }),
};
export const updatePost = {
  body: joi.object().required().keys({
    caption: joi.string(),
  }),
  params: joi.object().required().keys({
    id: joi.string().required(),
  }),
  headers: joi
    .object()
    .required()
    .keys({
      authorization: joi.string().required(),
    })
    .options({ allowUnknown: true }),
};
export const tokenAndId = {
  params: joi.object().required().keys({
    id: joi.string().required(),
  }),
  headers: joi
    .object()
    .required()
    .keys({
      authorization: joi.string().required(),
    })
    .options({ allowUnknown: true }),
};
export const id = {
  params: joi.object().required().keys({
    id: joi.string().required(),
  }),
};
