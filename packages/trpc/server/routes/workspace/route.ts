import { TRPCError } from "@trpc/server";
import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { workspaceService } from "../../services";
import { WorkspaceError } from "@repo/services/workspace";
import {
    createWorkspaceInputModel, createWorkspaceOutputModel,
    listWorkspacesInputModel, listWorkspacesOutputModel,
    getWorkspaceInputModel, getWorkspaceOutputModel,
    updateWorkspaceInputModel, updateWorkspaceOutputModel,
    deleteWorkspaceInputModel, deleteWorkspaceOutputModel,
    inviteMemberInputModel, inviteMemberOutputModel,
    acceptInvitationInputModel, acceptInvitationOutputModel,
    removeMemberInputModel, removeMemberOutputModel,
    updateMemberRoleInputModel, updateMemberRoleOutputModel,
    listMembersInputModel, listMembersOutputModel,
    leaveWorkspaceInputModel, leaveWorkspaceOutputModel,
    listPendingInvitationsInputModel, listPendingInvitationsOutputModel,
    revokeInvitationInputModel, revokeInvitationOutputModel,
} from "./model";

const getPath = generatePath("/workspace");
const TAGS = ["Workspace"];

function handleError(err: unknown): never {
    if (err instanceof WorkspaceError) {
        const codeMap = { NOT_FOUND: "NOT_FOUND", FORBIDDEN: "FORBIDDEN", CONFLICT: "CONFLICT", BAD_REQUEST: "BAD_REQUEST" } as const;
        throw new TRPCError({ code: codeMap[err.code], message: err.message });
    }
    throw err;
}

async function safe<T>(fn: () => Promise<T>): Promise<T> {
    try { return await fn(); } catch (err) { handleError(err); }
}

export const workspaceRouter = router({
    createWorkspace: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/createWorkspace"), tags: TAGS, protect: true } })
        .input(createWorkspaceInputModel).output(createWorkspaceOutputModel)
        .mutation(async ({ input, ctx }) => safe(() => workspaceService.createWorkspace({ ...input, userId: ctx.user.id }))),

    listWorkspaces: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/listWorkspaces"), tags: TAGS, protect: true } })
        .input(listWorkspacesInputModel).output(listWorkspacesOutputModel)
        .query(async ({ ctx }) => safe(() => workspaceService.listUserWorkspaces({ userId: ctx.user.id }))),

    getWorkspace: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/getWorkspace"), tags: TAGS, protect: true } })
        .input(getWorkspaceInputModel).output(getWorkspaceOutputModel)
        .query(async ({ input, ctx }) => safe(() => workspaceService.getWorkspace({ workspaceId: input.workspaceId, userId: ctx.user.id }))),

    updateWorkspace: authenticatedProcedure
        .meta({ openapi: { method: "PUT", path: getPath("/updateWorkspace"), tags: TAGS, protect: true } })
        .input(updateWorkspaceInputModel).output(updateWorkspaceOutputModel)
        .mutation(async ({ input, ctx }) => safe(() => workspaceService.updateWorkspace({ ...input, userId: ctx.user.id }))),

    deleteWorkspace: authenticatedProcedure
        .meta({ openapi: { method: "DELETE", path: getPath("/deleteWorkspace"), tags: TAGS, protect: true } })
        .input(deleteWorkspaceInputModel).output(deleteWorkspaceOutputModel)
        .mutation(async ({ input, ctx }) => safe(() => workspaceService.deleteWorkspace({ workspaceId: input.workspaceId, userId: ctx.user.id }))),

    inviteMember: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/inviteMember"), tags: TAGS, protect: true } })
        .input(inviteMemberInputModel).output(inviteMemberOutputModel)
        .mutation(async ({ input, ctx }) => safe(() => workspaceService.inviteMember({ ...input, invitedBy: ctx.user.id }))),

    acceptInvitation: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/acceptInvitation"), tags: TAGS, protect: true } })
        .input(acceptInvitationInputModel).output(acceptInvitationOutputModel)
        .mutation(async ({ input, ctx }) => safe(() => workspaceService.acceptInvitation({ token: input.token, userId: ctx.user.id }))),

    removeMember: authenticatedProcedure
        .meta({ openapi: { method: "DELETE", path: getPath("/removeMember"), tags: TAGS, protect: true } })
        .input(removeMemberInputModel).output(removeMemberOutputModel)
        .mutation(async ({ input, ctx }) => { await safe(() => workspaceService.removeMember({ ...input, userId: ctx.user.id })); return { success: true }; }),

    updateMemberRole: authenticatedProcedure
        .meta({ openapi: { method: "PUT", path: getPath("/updateMemberRole"), tags: TAGS, protect: true } })
        .input(updateMemberRoleInputModel).output(updateMemberRoleOutputModel)
        .mutation(async ({ input, ctx }) => { await safe(() => workspaceService.updateMemberRole({ ...input, userId: ctx.user.id })); return { success: true }; }),

    listMembers: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/listMembers"), tags: TAGS, protect: true } })
        .input(listMembersInputModel).output(listMembersOutputModel)
        .query(async ({ input, ctx }) => safe(() => workspaceService.listMembers({ workspaceId: input.workspaceId, userId: ctx.user.id }))),

    leaveWorkspace: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/leaveWorkspace"), tags: TAGS, protect: true } })
        .input(leaveWorkspaceInputModel).output(leaveWorkspaceOutputModel)
        .mutation(async ({ input, ctx }) => { await safe(() => workspaceService.leaveWorkspace({ workspaceId: input.workspaceId, userId: ctx.user.id })); return { success: true }; }),

    listPendingInvitations: authenticatedProcedure
        .meta({ openapi: { method: "GET", path: getPath("/listPendingInvitations"), tags: TAGS, protect: true } })
        .input(listPendingInvitationsInputModel).output(listPendingInvitationsOutputModel)
        .query(async ({ input, ctx }) => safe(() => workspaceService.listPendingInvitations({ workspaceId: input.workspaceId, userId: ctx.user.id }))),

    revokeInvitation: authenticatedProcedure
        .meta({ openapi: { method: "POST", path: getPath("/revokeInvitation"), tags: TAGS, protect: true } })
        .input(revokeInvitationInputModel).output(revokeInvitationOutputModel)
        .mutation(async ({ input, ctx }) => { await safe(() => workspaceService.revokeInvitation({ ...input, userId: ctx.user.id })); return { success: true }; }),
});
