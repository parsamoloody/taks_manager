function taskReminderLeadMinutes() {
  const configuredMinutes = Number(process.env.TASK_REMINDER_LEAD_MINUTES);
  if (Number.isFinite(configuredMinutes) && configuredMinutes >= 0) {
    return configuredMinutes;
  }

  const configuredDays = Number(process.env.TASK_REMINDER_LEAD_DAYS ?? '1');
  return (Number.isFinite(configuredDays) ? configuredDays : 1) * 24 * 60;
}

export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV,
    frontBaseUrl: process.env.FRONT_BASE_URL ?? 'http://localhost:3000',
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    ttl: process.env.JWT_TTL,
  },

  mail: {
    resendApiKey: process.env.RESEND_API_KEY,
    from: process.env.MAIL_FROM ?? 'Task Manager <onboarding@resend.dev>',
  },

  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  notifications: {
    invitationTtlHours: parseInt(process.env.INVITATION_TTL_HOURS ?? '168', 10),
    passwordResetTtlMinutes: parseInt(
      process.env.PASSWORD_RESET_TTL_MINUTES ?? '30',
      10,
    ),
    taskReminderLeadMinutes: taskReminderLeadMinutes(),
  },
});
