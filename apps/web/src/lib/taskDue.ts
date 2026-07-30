const DAY_MS = 24 * 60 * 60 * 1_000;

export type TaskDueState = "overdue" | "today" | "soon" | "upcoming";

export interface TaskDueInfo {
  state: TaskDueState;
  daysRemaining: number;
  reminderLeadDays: number;
  label: string;
}

export function getReminderLeadDays() {
  const configured = Number(process.env.NEXT_PUBLIC_TASK_REMINDER_DAYS ?? "1");
  return Number.isFinite(configured) && configured >= 0 ? configured : 1;
}

export function getTaskDueInfo(
  dueDate: string | null | undefined,
  isDone: boolean,
  now = new Date(),
): TaskDueInfo | null {
  if (!dueDate || isDone) return null;

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return null;

  const dueDay = Date.UTC(
    due.getUTCFullYear(),
    due.getUTCMonth(),
    due.getUTCDate(),
  );
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const daysRemaining = Math.round((dueDay - today) / DAY_MS);
  const reminderLeadDays = getReminderLeadDays();

  if (daysRemaining < 0) {
    const overdueDays = Math.abs(daysRemaining);
    return {
      state: "overdue",
      daysRemaining,
      reminderLeadDays,
      label:
        overdueDays === 1
          ? "Overdue by 1 day"
          : `Overdue by ${overdueDays} days`,
    };
  }

  if (daysRemaining === 0) {
    return {
      state: "today",
      daysRemaining,
      reminderLeadDays,
      label: "Due today",
    };
  }

  if (daysRemaining <= reminderLeadDays) {
    return {
      state: "soon",
      daysRemaining,
      reminderLeadDays,
      label:
        daysRemaining === 1 ? "Due tomorrow" : `Due in ${daysRemaining} days`,
    };
  }

  return {
    state: "upcoming",
    daysRemaining,
    reminderLeadDays,
    label: "",
  };
}

export function reminderTitle(days = getReminderLeadDays()) {
  if (days === 0) return "Email reminder on the due date";
  if (days === 1) return "Email reminder 1 day before the due date";
  return `Email reminder ${days} days before the due date`;
}
