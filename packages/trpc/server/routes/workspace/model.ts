import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const roleEnum = z.enum(["OWNER", "ADMIN", "EDITOR", "VIEWER"]);
const assignableRoleEnum = z.enum(["ADMIN", "EDITOR", "VIEWER"]);

export const createWorkspaceInputModel = z.object({ name: z.string().min(1).max(100), slug: z.string().min(3).max(80).regex(slugRegex, "Must be lowercase letters, numbers, and hyphens") });
export const createWorkspaceOutputModel = z.object({ id: z.string() });

export const listWorkspacesInputModel = z.object({}).optional();
export const listWorkspacesOutputModel = z.array(z.object({ id: z.string(), name: z.string(), slug: z.string(), role: roleEnum, createdAt: z.date().nullable() }));

export const getWorkspaceInputModel = z.object({ workspaceId: z.string().uuid() });
export const getWorkspaceOutputModel = z.object({ id: z.string(), name: z.string(), slug: z.string(), ownerId: z.string(), createdAt: z.date().nullable(), updatedAt: z.date().nullable() });

export const updateWorkspaceInputModel = z.object({ workspaceId: z.string().uuid(), name: z.string().min(1).max(100).optional(), slug: z.string().min(3).max(80).regex(slugRegex).optional() });
export const updateWorkspaceOutputModel = z.object({ id: z.string() });

export const deleteWorkspaceInputModel = z.object({ workspaceId: z.string().uuid() });
export const deleteWorkspaceOutputModel = z.object({ id: z.string() });

export const inviteMemberInputModel = z.object({ workspaceId: z.string().uuid(), email: z.string().email(), role: assignableRoleEnum });
export const inviteMemberOutputModel = z.object({ id: z.string(), token: z.string() });

export const acceptInvitationInputModel = z.object({ token: z.string().min(1).max(128) });
export const acceptInvitationOutputModel = z.object({ workspaceId: z.string() });

export const removeMemberInputModel = z.object({ workspaceId: z.string().uuid(), memberId: z.string().uuid() });
export const removeMemberOutputModel = z.object({ success: z.boolean() });

export const updateMemberRoleInputModel = z.object({ workspaceId: z.string().uuid(), memberId: z.string().uuid(), role: assignableRoleEnum });
export const updateMemberRoleOutputModel = z.object({ success: z.boolean() });

export const listMembersInputModel = z.object({ workspaceId: z.string().uuid() });
export const listMembersOutputModel = z.array(z.object({ id: z.string(), role: roleEnum, joinedAt: z.date().nullable(), userId: z.string(), fullName: z.string(), email: z.string() }));

export const leaveWorkspaceInputModel = z.object({ workspaceId: z.string().uuid() });
export const leaveWorkspaceOutputModel = z.object({ success: z.boolean() });

export const listPendingInvitationsInputModel = z.object({ workspaceId: z.string().uuid() });
export const listPendingInvitationsOutputModel = z.array(z.object({ id: z.string(), email: z.string(), role: assignableRoleEnum, createdAt: z.date().nullable(), expiresAt: z.date() }));

export const revokeInvitationInputModel = z.object({ invitationId: z.string().uuid(), workspaceId: z.string().uuid() });
export const revokeInvitationOutputModel = z.object({ success: z.boolean() });
