import { db } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { workspaceMembersTable } from "@repo/database/models/workspace";
import { eq, and } from "drizzle-orm";

// Single source of truth for "can this user touch this form?" checks.
// Used by form, form-field and AI features so the permission model lives in one place.

const WRITE_ROLES = new Set(["OWNER", "ADMIN", "EDITOR"]);

/**
 * Throws "Form not found" if the user can neither read the form.
 * Read access = creator OR any member of the form's workspace.
 */
export async function assertFormReadAccess(formId: string, userId: string) {
    const form = await db
        .select({ createdBy: formsTable.createdBy, workspaceId: formsTable.workspaceId })
        .from(formsTable)
        .where(eq(formsTable.id, formId));
    if (!form?.[0]) throw new Error("Form not found");
    if (form[0].createdBy === userId) return;
    if (form[0].workspaceId) {
        const membership = await db
            .select({ id: workspaceMembersTable.id })
            .from(workspaceMembersTable)
            .where(and(eq(workspaceMembersTable.workspaceId, form[0].workspaceId), eq(workspaceMembersTable.userId, userId)));
        if (membership.length > 0) return;
    }
    throw new Error("Form not found");
}

/**
 * Write access = creator OR workspace OWNER/ADMIN/EDITOR.
 * Throws "Form not found" when the user can't see the form at all, and a
 * permission error when they can see it but lack a write role.
 */
export async function assertFormWriteAccess(formId: string, userId: string) {
    const form = await db
        .select({ createdBy: formsTable.createdBy, workspaceId: formsTable.workspaceId })
        .from(formsTable)
        .where(eq(formsTable.id, formId));
    if (!form?.[0]) throw new Error("Form not found");
    if (form[0].createdBy === userId) return; // creator always has access
    if (form[0].workspaceId) {
        const membership = await db
            .select({ role: workspaceMembersTable.role })
            .from(workspaceMembersTable)
            .where(and(eq(workspaceMembersTable.workspaceId, form[0].workspaceId), eq(workspaceMembersTable.userId, userId)));
        if (membership?.[0]) {
            if (WRITE_ROLES.has(membership[0].role)) return;
            throw new Error("You don't have permission to edit forms in this workspace");
        }
    }
    throw new Error("Form not found");
}
