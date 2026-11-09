// User fields that must never leave the server, even to an admin's
// browser: the password hash and password-reset token/expiry.
const SECRET_USER_FIELDS = ['password', 'resetToken', 'resetTokenExpiry'] as const;

export function toAdminSafeUser(id: string, data: Record<string, unknown> | undefined): Record<string, unknown> {
    const out: Record<string, unknown> = { id, ...(data || {}) };
    for (const field of SECRET_USER_FIELDS) delete out[field];
    return out;
}
