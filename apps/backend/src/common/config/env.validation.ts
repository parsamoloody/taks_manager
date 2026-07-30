import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().port().default(8000),

  DATABASE_URL: Joi.string().uri().required(),

  FRONT_BASE_URL: Joi.string().uri().default('http://localhost:3000'),

  JWT_SECRET: Joi.string().min(1).required(),

  JWT_TTL: Joi.string().min(1).required(),

  RESEND_API_KEY: Joi.string().allow('').optional(),

  MAIL_FROM: Joi.string()
    .min(3)
    .default('Task Manager <onboarding@resend.dev>'),

  REDIS_HOST: Joi.string().min(1).default('localhost'),

  REDIS_PORT: Joi.number().port().default(6379),

  REDIS_PASSWORD: Joi.string().allow('').optional(),

  INVITATION_TTL_HOURS: Joi.number().integer().positive().default(168),

  PASSWORD_RESET_TTL_MINUTES: Joi.number().integer().positive().default(30),

  TASK_REMINDER_LEAD_MINUTES: Joi.number().integer().min(0).default(60),
});
