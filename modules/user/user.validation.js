import joi from "joi";

export const updateProfile = {
  body: joi
    .object()
    .required()
    .keys({
      userName: joi.string(),
      email: joi.string().email(),
      password: joi
        .string()
        .pattern(
          new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
        ),
      cPassword: joi.string().valid(joi.ref("password")),
      gender: joi.string(),
    }),
  headers: joi
    .object()
    .required()
    .keys({
      authorization: joi.string().required(),
    })
    .options({ allowUnknown: true }),
};
export const headers = {
    headers: joi
    .object()
    .required()
    .keys({
      authorization: joi.string().required(),
    })
    .options({ allowUnknown: true }),
}