import configuration from './configuration';

describe('notification configuration', () => {
  const originalDays = process.env.TASK_REMINDER_LEAD_DAYS;
  const originalMinutes = process.env.TASK_REMINDER_LEAD_MINUTES;

  afterEach(() => {
    if (originalDays === undefined) {
      delete process.env.TASK_REMINDER_LEAD_DAYS;
    } else {
      process.env.TASK_REMINDER_LEAD_DAYS = originalDays;
    }

    if (originalMinutes === undefined) {
      delete process.env.TASK_REMINDER_LEAD_MINUTES;
    } else {
      process.env.TASK_REMINDER_LEAD_MINUTES = originalMinutes;
    }
  });

  it('defaults task reminders to one day before the due date', () => {
    delete process.env.TASK_REMINDER_LEAD_DAYS;
    delete process.env.TASK_REMINDER_LEAD_MINUTES;

    expect(configuration().notifications.taskReminderLeadMinutes).toBe(1_440);
  });

  it('supports days and a more precise minutes override', () => {
    process.env.TASK_REMINDER_LEAD_DAYS = '2';
    delete process.env.TASK_REMINDER_LEAD_MINUTES;
    expect(configuration().notifications.taskReminderLeadMinutes).toBe(2_880);

    process.env.TASK_REMINDER_LEAD_MINUTES = '90';
    expect(configuration().notifications.taskReminderLeadMinutes).toBe(90);
  });
});
