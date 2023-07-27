import joi from "joi";
export const addComment = {
  body: joi.object().required().keys({
    text: joi.string(),
  }),
  params: joi.object().required().keys({
    postId: joi.string().required(),
  }),
  headers: joi
    .object()
    .required()
    .keys({
      authorization: joi.string().required(),
    })
    .options({ allowUnknown: true }),
};
export const addReply = {
  body: joi.object().required().keys({
    text: joi.string(),
    commentId: joi.string().required(),
  }),
  headers: joi
    .object()
    .required()
    .keys({
      authorization: joi.string().required(),
    })
    .options({ allowUnknown: true }),
};
export const updateReply = {
  body: joi.object().required().keys({
    text: joi.string(),
    imageId: joi.string(),
    commentId: joi.string().required(),
  }),
  params: joi.object().required().keys({
    replyId: joi.string().required(),
  }),
  headers: joi
    .object()
    .required()
    .keys({
      authorization: joi.string().required(),
    })
    .options({ allowUnknown: true }),
};
export const updateComment = {
  body: joi.object().required().keys({
    text: joi.string(),
    imageId: joi.string(),
  }),
  params: joi.object().required().keys({
    postId: joi.string().required(),
    commentId: joi.string().required(),
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
    commentId: joi.string().required(),
  }),
  headers: joi
    .object()
    .required()
    .keys({
      authorization: joi.string().required(),
    })
    .options({ allowUnknown: true }),
};
