const dataMethods = ["body", "params", "query", "headers"];
const validation = (schema) => {
  return (req, res, next) => {
    const validationErr = [];
    dataMethods.forEach((key) => {
      if (schema[key]) {
        const validationResult = schema[key].validate(req[key], {
          abortEarly: false,
        });
        if (validationResult?.error?.details) {
          validationErr.push(validationResult.error.details);
        }
      }
    });
    if (validationErr.length) {
      return res
        .status(400)
        .json({ message: "validation error", err: validationErr });
    } else {
      return next();
    }
  };
};
export default validation;
