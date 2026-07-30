function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function layout(content: string): string {
  return `
    <!doctype html>
    <html lang="en">
      <body style="margin:0;background:#f4f5f7;color:#172b4d;font-family:Arial,sans-serif">
        <div style="max-width:560px;margin:0 auto;padding:32px 20px">
          <div style="background:#ffffff;border:1px solid #dfe1e6;border-radius:8px;padding:32px">
            <h1 style="margin:0 0 24px;font-size:24px">Task Manager</h1>
            ${content}
          </div>
        </div>
      </body>
    </html>
  `.trim();
}

function actionLink(label: string, url: string): string {
  return `<a href="${escapeHtml(url)}" style="display:inline-block;background:#0c66e4;color:#ffffff;text-decoration:none;border-radius:4px;padding:12px 18px;font-weight:600">${escapeHtml(label)}</a>`;
}

export function workspaceInvitationTemplate(input: {
  workspaceName: string;
  boardName?: string;
  inviterName: string;
  inviteUrl: string;
  expiresAt: string;
}) {
  const workspaceName = escapeHtml(input.workspaceName);
  const inviterName = escapeHtml(input.inviterName);
  const expiry = new Date(input.expiresAt).toUTCString();
  const destination = input.boardName
    ? `the board <strong>${escapeHtml(input.boardName)}</strong> in <strong>${workspaceName}</strong>`
    : `<strong>${workspaceName}</strong>`;

  return {
    subject: input.boardName
      ? `Invitation to join ${input.boardName}`
      : `Invitation to join ${input.workspaceName}`,
    html: layout(`
      <p><strong>${inviterName}</strong> invited you to join ${destination}.</p>
      <p style="margin:24px 0">${actionLink('Accept invitation', input.inviteUrl)}</p>
      <p style="color:#626f86;font-size:13px">This invitation expires ${escapeHtml(expiry)}.</p>
    `),
    text: `${input.inviterName} invited you to join ${input.boardName ? `${input.boardName} in ` : ''}${input.workspaceName}. Accept the invitation: ${input.inviteUrl}. This invitation expires ${expiry}.`,
  };
}

export function passwordResetTemplate(input: {
  resetUrl: string;
  expiresAt: string;
}) {
  const expiry = new Date(input.expiresAt).toUTCString();

  return {
    subject: 'Reset your Task Manager password',
    html: layout(`
      <p>We received a request to reset your password.</p>
      <p style="margin:24px 0">${actionLink('Reset password', input.resetUrl)}</p>
      <p style="color:#626f86;font-size:13px">This link expires ${escapeHtml(expiry)}. If you did not request it, you can ignore this email.</p>
    `),
    text: `Reset your Task Manager password: ${input.resetUrl}. This link expires ${expiry}. If you did not request it, ignore this email.`,
  };
}

export function taskReminderTemplate(input: {
  taskTitle: string;
  workspaceName: string;
  dueDate: Date;
  taskUrl: string;
}) {
  const dueDate = input.dueDate.toUTCString();

  return {
    subject: `Task due soon: ${input.taskTitle}`,
    html: layout(`
      <p><strong>${escapeHtml(input.taskTitle)}</strong> in ${escapeHtml(input.workspaceName)} is due ${escapeHtml(dueDate)}.</p>
      <p style="margin:24px 0">${actionLink('View task', input.taskUrl)}</p>
    `),
    text: `${input.taskTitle} in ${input.workspaceName} is due ${dueDate}. View task: ${input.taskUrl}`,
  };
}
