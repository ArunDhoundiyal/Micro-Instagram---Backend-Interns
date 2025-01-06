const Joi = require('joi')

const checkUserCredentials = Joi.object({
    user_name:Joi.string().max(256).pattern(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/).required().messages({
        "string.pattern.base":
        "User name must only contain letters, with optional single spaces between words..!",
      "string.max": "User name must be below or equal to 256 characters..!",
      "any.required": "User name is required!",}),
      user_email: Joi.string().email().required().messages({
        "string.email": "Invalid email address format!",
        "any.required": "Email address is required!",
      }),
      user_password: Joi.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/)
        .required()
        .messages({
          "string.pattern.base":
            "Password must include at least one uppercase letter, one lowercase letter, one digit, one special character (@#$%^&*!), and be at least 8 characters long!",
          "any.required": "Password is required!",
        }),
        user_number:Joi.string().pattern(/^(?:\d{10}|\d{15})$/).required().messages({"string.pattern.base": "Phone number must be either 10 or 15 digits long.","string.empty": "Phone number is required.",})
})

const loginUserCredentials = Joi.object({
    user_email: Joi.string().email().required().messages({
        "string.email": "Invalid email address format!",
        "any.required": "Email address is required!",
      }),
      user_password: Joi.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/)
        .required()
        .messages({
          "string.pattern.base":
            "Password must include at least one uppercase letter, one lowercase letter, one digit, one special character (@#$%^&*!), and be at least 8 characters long!",
          "any.required": "Password is required!",
        }),
        user_number:Joi.string().pattern(/^(?:\d{10}|\d{15})$/).required().messages({"string.pattern.base": "Phone number must be either 10 or 15 digits long.","string.empty": "Phone number is required.",})

})

module.exports = {checkUserCredentials, loginUserCredentials} 