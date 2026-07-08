import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().port().default(8000),

  DATABASE_URL: Joi.string().uri().required(),

  JWT_SECRET: Joi.string().min(1).required(),

  JWT_TTL: Joi.string().min(1).required(),
});
