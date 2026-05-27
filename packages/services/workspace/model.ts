import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const roles = ["OWNER", "ADMIN", "EDITOR", "VIEWER"] as const;

export const createWorkspaceInput = z.object({
    name: z.string().min(1).max(100),
    slug: z.string().min(3).max(80).regex(slugRegex, "Slug must be lowercase alphanumeric with hyphens"),
    userId: z.string().uuid(),
});
export type CreateWorkspaceInputType = z.infer<typeof createWorkspaceInput>;

export const listUserWorkspacesInput = z.object({ userId: z.string().uuid() });
export type ListUserWorkspacesInputType = z.infer<typeof listUserWorkspacesInput>;

export const getWorkspaceInput = z.object({ workspaceId: z.string().uuid(), userId: z.string().uuid() });
export type GetWorkspaceInputType = z.infer<typeof getWorkspaceInput>;

export const updateWorkspaceInput = z.object({
    workspaceId: z.string().uuid(),
    userId: z.string().uuid(),
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(3).max(80).regex(slugRegex).optional(),
});
export type UpdateWorkspaceInputType = z.infer<typeof updateWorkspaceInput>;

export const deleteWorkspaceInput = z.object({ workspaceId: z.string().uuid(), userId: z.string().uuid() });
export type DeleteWorkspaceInputType = z.infer<typeof deleteWorkspaceInput>;

export const inviteMemberInput = z.object({
    workspaceId: z.string().uuid(),
    email: z.string().email(),
    role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
    invitedBy: z.string().uuid(),
});
export type InviteMemberInputType = z.infer<typeof inviteMemberInput>;

export const acceptInvitationInput = z.object({ token: z.string().min(1), userId: z.string().uuid() });
export type AcceptInvitationInputType = z.infer<typeof acceptInvitationInput>;

export const removeMemberInput = z.object({ workspaceId: z.string().uuid(), memberId: z.string().uuid(), userId: z.string().uuid() });
export type RemoveMemberInputType = z.infer<typeof removeMemberInput>;

export const updateMemberRoleInput = z.object({
    workspaceId: z.string().uuid(),
    memberId: z.string().uuid(),
    role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
    userId: z.string().uuid(),
});
export type UpdateMemberRoleInputType = z.infer<typeof updateMemberRoleInput>;

export const listMembersInput = z.object({ workspaceId: z.string().uuid(), userId: z.string().uuid() });
export type ListMembersInputType = z.infer<typeof listMembersInput>;

export const leaveWorkspaceInput = z.object({ workspaceId: z.string().uuid(), userId: z.string().uuid() });
export type LeaveWorkspaceInputType = z.infer<typeof leaveWorkspaceInput>;

export const listPendingInvitationsInput = z.object({ workspaceId: z.string().uuid(), userId: z.string().uuid() });
export type ListPendingInvitationsInputType = z.infer<typeof listPendingInvitationsInput>;

export const revokeInvitationInput = z.object({ invitationId: z.string().uuid(), workspaceId: z.string().uuid(), userId: z.string().uuid() });
export type RevokeInvitationInputType = z.infer<typeof revokeInvitationInput>;
