const { body, validationResult } = require('express-validator');

exports.validateRegister = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('phone').isMobilePhone(),
];

exports.validateLogin = [
  body('email').isEmail(),
  body('password').notEmpty(),
];

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
