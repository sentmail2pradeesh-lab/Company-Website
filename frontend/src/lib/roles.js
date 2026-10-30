// Master admins have full control and are exempt from shift tracking.
// The server sends `is_master_admin` on the user object; this list is only for places that
// have an email but no user object (for example, rows from the employee list).
export const MASTER_ADMIN_EMAILS = ['arun@aszen.com', 'gokul@aszen.com'];
