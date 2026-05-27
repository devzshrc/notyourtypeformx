import { db, eq, and } from "@repo/database";
import { workspacesTable, workspaceMembersTable, workspaceInvitationsTable } from "@repo/database/models/workspace";
import { formsTable } from "@repo/database/models/form";
import { usersTable } from "@repo/database/models/user";
import crypto from "crypto";
import {
    createWorkspaceInput, type CreateWorkspaceInputType,
    listUserWorkspacesInput, type ListUserWorkspacesInputType,
    getWorkspaceInput, type GetWorkspaceInputType,
    updateWorkspaceInput, type UpdateWorkspaceInputType,
    deleteWorkspaceInput, type DeleteWorkspaceInputType,
    inviteMemberInput, type InviteMemberInputType,
    acceptInvitationInput, type AcceptInvitationInputType,
    removeMemberInput, type RemoveMemberInputType,
    updateMemberRoleInput, type UpdateMemberRoleInputType,
    listMembersInput, type ListMembersInputType,
    leaveWorkspaceInput, type LeaveWorkspaceInputType,
    listPendingInvitationsInput, type ListPendingInvitationsInputType,
    revokeInvitationInput, type RevokeInvitationInputType,
} from "./model";

// ─── Error types ──────────────────────────────────────────────────────────────

export class WorkspaceError extends Error {
    constructor(public code: "NOT_FOUND" | "FORBIDDEN" | "CONFLICT" | "BAD_REQUEST", message: string) {
        super(message);
        this.name = "WorkspaceError";
    }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_HIERARCHY = { OWNER: 0, ADMIN: 1, EDITOR: 2, VIEWER: 3 } as const;
type Role = keyof typeof ROLE_HIERARCHY;

const RESERVED_SLUGS = new Set([
    "admin", "api", "app", "dashboard", "signin", "signup", "form", "forms",
    "templates", "embed", "f", "pricing", "settings", "invite", "workspace", "workspaces",
]);

// ─── Service ──────────────────────────────────────────────────────────────────

export default class WorkspaceService {

    // ── Create ────────────────────────────────────────────────────────────────

    async createWorkspace(payload: CreateWorkspaceInputType) {
        const { name, slug, userId } = await createWorkspaceInput.parseAsync(payload);

        // Rate limit: max 10 workspaces per user
        const existing = await db.select({ id: workspacesTable.id }).from(workspacesTable).where(eq(workspacesTable.ownerId, userId));
        if (existing.length >= 10) {
            throw new WorkspaceError("BAD_REQUEST", "You can own a maximum of 10 workspaces");
        }

        // Reserved slug check
        if (RESERVED_SLUGS.has(slug)) {
            throw new WorkspaceError("CONFLICT", "This workspace URL is reserved. Please choose a different one.");
        }

        // Uniqueness check (avoid raw DB constraint error)
        const existingSlug = await db.select({ id: workspacesTable.id }).from(workspacesTable).where(eq(workspacesTable.slug, slug));
        if (existingSlug.length > 0) {
            throw new WorkspaceError("CONFLICT", "A workspace with this URL already exists. Please choose a different one.");
        }

        const result = await db.insert(workspacesTable).values({ name: name.trim(), slug, ownerId: userId }).returning({ id: workspacesTable.id });
        if (!result?.[0]) throw new WorkspaceError("BAD_REQUEST", "Failed to create workspace");

        // Auto-add creator as OWNER member
        await db.insert(workspaceMembersTable).values({ workspaceId: result[0].id, userId, role: "OWNER", joinedAt: new Date() });
        return { id: result[0].id };
    }

    // ── List ──────────────────────────────────────────────────────────────────

    async listUserWorkspaces(payload: ListUserWorkspacesInputType) {
        const { userId } = await listUserWorkspacesInput.parseAsync(payload);
        return await db
            .select({ id: workspacesTable.id, name: workspacesTable.name, slug: workspacesTable.slug, role: workspaceMembersTable.role, createdAt: workspacesTable.createdAt })
            .from(workspaceMembersTable)
            .innerJoin(workspacesTable, eq(workspaceMembersTable.workspaceId, workspacesTable.id))
            .where(eq(workspaceMembersTable.userId, userId));
    }

    // ── Get ───────────────────────────────────────────────────────────────────

    async getWorkspace(payload: GetWorkspaceInputType) {
        const { workspaceId, userId } = await getWorkspaceInput.parseAsync(payload);
        await this.assertRole({ workspaceId, userId, minRole: "VIEWER" });
        const result = await db.select().from(workspacesTable).where(eq(workspacesTable.id, workspaceId));
        if (!result?.[0]) throw new WorkspaceError("NOT_FOUND", "Workspace not found");
        return result[0];
    }

    // ── Update ────────────────────────────────────────────────────────────────

    async updateWorkspace(payload: UpdateWorkspaceInputType) {
        const { workspaceId, userId, name, slug } = await updateWorkspaceInput.parseAsync(payload);
        await this.assertRole({ workspaceId, userId, minRole: "ADMIN" });

        const updates: Record<string, unknown> = {};
        if (name !== undefined) updates.name = name.trim();
        if (slug !== undefined) {
            if (RESERVED_SLUGS.has(slug)) {
                throw new WorkspaceError("CONFLICT", "This workspace URL is reserved.");
            }
            const existing = await db.select({ id: workspacesTable.id }).from(workspacesTable).where(eq(workspacesTable.slug, slug));
            if (existing.length > 0 && existing[0]!.id !== workspaceId) {
                throw new WorkspaceError("CONFLICT", "A workspace with this URL already exists.");
            }
            updates.slug = slug;
        }
        if (Object.keys(updates).length === 0) throw new WorkspaceError("BAD_REQUEST", "Nothing to update");

        const result = await db.update(workspacesTable).set(updates).where(eq(workspacesTable.id, workspaceId)).returning({ id: workspacesTable.id });
        if (!result?.[0]) throw new WorkspaceError("NOT_FOUND", "Workspace not found");
        return { id: result[0].id };
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    async deleteWorkspace(payload: DeleteWorkspaceInputType) {
        const { workspaceId, userId } = await deleteWorkspaceInput.parseAsync(payload);
        await this.assertRole({ workspaceId, userId, minRole: "OWNER" });

        // Detach forms from workspace (don't delete them — just unlink)
        await db.update(formsTable).set({ workspaceId: null }).where(eq(formsTable.workspaceId, workspaceId));

        // Delete invitations, members, then workspace
        await db.delete(workspaceInvitationsTable).where(eq(workspaceInvitationsTable.workspaceId, workspaceId));
        await db.delete(workspaceMembersTable).where(eq(workspaceMembersTable.workspaceId, workspaceId));
        await db.delete(workspacesTable).where(eq(workspacesTable.id, workspaceId));
        return { id: workspaceId };
    }

    // ── Invite ────────────────────────────────────────────────────────────────

    async inviteMember(payload: InviteMemberInputType) {
        const { workspaceId, email, role, invitedBy } = await inviteMemberInput.parseAsync(payload);
        await this.assertRole({ workspaceId, userId: invitedBy, minRole: "ADMIN" });

        const normalizedEmail = email.toLowerCase().trim();

        // Prevent self-invite
        const inviter = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.id, invitedBy));
        if (inviter?.[0]?.email.toLowerCase() === normalizedEmail) {
            throw new WorkspaceError("BAD_REQUEST", "You cannot invite yourself");
        }

        // Check if already a member
        const existingUser = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, normalizedEmail));
        if (existingUser?.[0]) {
            const existingMember = await db.select({ id: workspaceMembersTable.id }).from(workspaceMembersTable).where(and(eq(workspaceMembersTable.workspaceId, workspaceId), eq(workspaceMembersTable.userId, existingUser[0].id)));
            if (existingMember.length > 0) {
                throw new WorkspaceError("CONFLICT", "This person is already a member of this workspace");
            }
        }

        // Revoke any existing pending invitation for same email + workspace (replace with new one)
        await db.update(workspaceInvitationsTable).set({ status: "EXPIRED" }).where(and(eq(workspaceInvitationsTable.workspaceId, workspaceId), eq(workspaceInvitationsTable.email, normalizedEmail), eq(workspaceInvitationsTable.status, "PENDING")));

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const result = await db.insert(workspaceInvitationsTable).values({ workspaceId, email: normalizedEmail, role, invitedBy, token, expiresAt }).returning({ id: workspaceInvitationsTable.id });
        if (!result?.[0]) throw new WorkspaceError("BAD_REQUEST", "Failed to create invitation");
        return { id: result[0].id, token };
    }

    // ── Accept Invitation ─────────────────────────────────────────────────────

    async acceptInvitation(payload: AcceptInvitationInputType) {
        const { token, userId } = await acceptInvitationInput.parseAsync(payload);

        const rows = await db.select().from(workspaceInvitationsTable).where(and(eq(workspaceInvitationsTable.token, token), eq(workspaceInvitationsTable.status, "PENDING")));
        if (!rows?.[0]) throw new WorkspaceError("NOT_FOUND", "Invitation not found or has already been used");

        const inv = rows[0];

        // Check expiry
        if (new Date() > inv.expiresAt) {
            await db.update(workspaceInvitationsTable).set({ status: "EXPIRED" }).where(eq(workspaceInvitationsTable.id, inv.id));
            throw new WorkspaceError("BAD_REQUEST", "This invitation has expired. Please ask the workspace admin for a new one.");
        }

        // Verify email match
        const userRows = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.id, userId));
        if (!userRows?.[0]) throw new WorkspaceError("NOT_FOUND", "User not found");
        if (userRows[0].email.toLowerCase() !== inv.email.toLowerCase()) {
            throw new WorkspaceError("FORBIDDEN", "This invitation was sent to a different email address. Please sign in with the correct account.");
        }

        // Check if workspace still exists
        const ws = await db.select({ id: workspacesTable.id }).from(workspacesTable).where(eq(workspacesTable.id, inv.workspaceId));
        if (!ws?.[0]) {
            await db.update(workspaceInvitationsTable).set({ status: "EXPIRED" }).where(eq(workspaceInvitationsTable.id, inv.id));
            throw new WorkspaceError("NOT_FOUND", "The workspace no longer exists");
        }

        // Idempotent: if already a member, just mark invitation accepted
        const existing = await db.select({ id: workspaceMembersTable.id }).from(workspaceMembersTable).where(and(eq(workspaceMembersTable.workspaceId, inv.workspaceId), eq(workspaceMembersTable.userId, userId)));
        await db.update(workspaceInvitationsTable).set({ status: "ACCEPTED" }).where(eq(workspaceInvitationsTable.id, inv.id));

        if (existing.length === 0) {
            await db.insert(workspaceMembersTable).values({ workspaceId: inv.workspaceId, userId, role: inv.role, joinedAt: new Date() });
        }

        return { workspaceId: inv.workspaceId };
    }

    // ── Remove Member ─────────────────────────────────────────────────────────

    async removeMember(payload: RemoveMemberInputType) {
        const { workspaceId, memberId, userId } = await removeMemberInput.parseAsync(payload);
        await this.assertRole({ workspaceId, userId, minRole: "ADMIN" });

        const member = await db.select({ role: workspaceMembersTable.role, userId: workspaceMembersTable.userId }).from(workspaceMembersTable).where(and(eq(workspaceMembersTable.id, memberId), eq(workspaceMembersTable.workspaceId, workspaceId)));
        if (!member?.[0]) throw new WorkspaceError("NOT_FOUND", "Member not found");
        if (member[0].role === "OWNER") throw new WorkspaceError("FORBIDDEN", "Cannot remove the workspace owner");

        // Admin can't remove other admins — only owner can
        const actorRole = await this.getRole(workspaceId, userId);
        if (member[0].role === "ADMIN" && actorRole !== "OWNER") {
            throw new WorkspaceError("FORBIDDEN", "Only the workspace owner can remove admins");
        }

        await db.delete(workspaceMembersTable).where(eq(workspaceMembersTable.id, memberId));
    }

    // ── Leave Workspace ───────────────────────────────────────────────────────

    async leaveWorkspace(payload: LeaveWorkspaceInputType) {
        const { workspaceId, userId } = await leaveWorkspaceInput.parseAsync(payload);

        const member = await db.select({ id: workspaceMembersTable.id, role: workspaceMembersTable.role }).from(workspaceMembersTable).where(and(eq(workspaceMembersTable.workspaceId, workspaceId), eq(workspaceMembersTable.userId, userId)));
        if (!member?.[0]) throw new WorkspaceError("NOT_FOUND", "You are not a member of this workspace");
        if (member[0].role === "OWNER") throw new WorkspaceError("FORBIDDEN", "The owner cannot leave the workspace. Transfer ownership or delete the workspace instead.");

        await db.delete(workspaceMembersTable).where(eq(workspaceMembersTable.id, member[0].id));
    }

    // ── Update Member Role ────────────────────────────────────────────────────

    async updateMemberRole(payload: UpdateMemberRoleInputType) {
        const { workspaceId, memberId, role, userId } = await updateMemberRoleInput.parseAsync(payload);
        await this.assertRole({ workspaceId, userId, minRole: "OWNER" });

        const member = await db.select({ role: workspaceMembersTable.role, userId: workspaceMembersTable.userId }).from(workspaceMembersTable).where(and(eq(workspaceMembersTable.id, memberId), eq(workspaceMembersTable.workspaceId, workspaceId)));
        if (!member?.[0]) throw new WorkspaceError("NOT_FOUND", "Member not found");
        if (member[0].role === "OWNER") throw new WorkspaceError("FORBIDDEN", "Cannot change the owner's role");
        if (member[0].userId === userId) throw new WorkspaceError("BAD_REQUEST", "Cannot change your own role");

        await db.update(workspaceMembersTable).set({ role }).where(eq(workspaceMembersTable.id, memberId));
    }

    // ── List Members ──────────────────────────────────────────────────────────

    async listMembers(payload: ListMembersInputType) {
        const { workspaceId, userId } = await listMembersInput.parseAsync(payload);
        await this.assertRole({ workspaceId, userId, minRole: "VIEWER" });
        return await db
            .select({ id: workspaceMembersTable.id, role: workspaceMembersTable.role, joinedAt: workspaceMembersTable.joinedAt, userId: usersTable.id, fullName: usersTable.fullName, email: usersTable.email })
            .from(workspaceMembersTable)
            .innerJoin(usersTable, eq(workspaceMembersTable.userId, usersTable.id))
            .where(eq(workspaceMembersTable.workspaceId, workspaceId));
    }

    // ── Pending Invitations ─────────────────────────────────────────────────

    async listPendingInvitations(payload: ListPendingInvitationsInputType) {
        const { workspaceId, userId } = await listPendingInvitationsInput.parseAsync(payload);
        await this.assertRole({ workspaceId, userId, minRole: "ADMIN" });
        return await db
            .select({ id: workspaceInvitationsTable.id, email: workspaceInvitationsTable.email, role: workspaceInvitationsTable.role, createdAt: workspaceInvitationsTable.createdAt, expiresAt: workspaceInvitationsTable.expiresAt })
            .from(workspaceInvitationsTable)
            .where(and(eq(workspaceInvitationsTable.workspaceId, workspaceId), eq(workspaceInvitationsTable.status, "PENDING")));
    }

    async revokeInvitation(payload: RevokeInvitationInputType) {
        const { invitationId, workspaceId, userId } = await revokeInvitationInput.parseAsync(payload);
        await this.assertRole({ workspaceId, userId, minRole: "ADMIN" });
        const result = await db.update(workspaceInvitationsTable).set({ status: "EXPIRED" }).where(and(eq(workspaceInvitationsTable.id, invitationId), eq(workspaceInvitationsTable.workspaceId, workspaceId), eq(workspaceInvitationsTable.status, "PENDING"))).returning({ id: workspaceInvitationsTable.id });
        if (!result?.[0]) throw new WorkspaceError("NOT_FOUND", "Invitation not found or already used");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private async getRole(workspaceId: string, userId: string): Promise<Role | null> {
        const rows = await db.select({ role: workspaceMembersTable.role }).from(workspaceMembersTable).where(and(eq(workspaceMembersTable.workspaceId, workspaceId), eq(workspaceMembersTable.userId, userId)));
        return (rows?.[0]?.role as Role) ?? null;
    }

    async assertRole(input: { workspaceId: string; userId: string; minRole: Role }) {
        const role = await this.getRole(input.workspaceId, input.userId);
        if (!role) throw new WorkspaceError("FORBIDDEN", "You are not a member of this workspace");
        if (ROLE_HIERARCHY[role] > ROLE_HIERARCHY[input.minRole]) {
            throw new WorkspaceError("FORBIDDEN", "You don't have permission to perform this action");
        }
    }
}
