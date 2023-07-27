import joi from "joi";

export const addPost = {
  body: joi.object().required().keys({
    title: joi.string().required(),
    caption: joi.string().required(),
  }),
  headers: joi
    .object()
    .required()
    .keys({
      authorization: joi.string().required(),
    })
    .options({ allowUnknown: true }),
};
export const like = {
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
