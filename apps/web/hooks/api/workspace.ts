import { trpc } from "~/trpc/client";

export function useCreateWorkspace() {
    const utils = trpc.useUtils();
    const mutation = trpc.workspace.createWorkspace.useMutation({ onSuccess: () => { utils.workspace.listWorkspaces.invalidate(); } });
    return { createWorkspaceAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useListWorkspaces() {
    const { data: workspaces, isLoading, error } = trpc.workspace.listWorkspaces.useQuery({});
    return { workspaces, isLoading, error };
}

export function useGetWorkspace(workspaceId: string) {
    const { data: workspace, isLoading } = trpc.workspace.getWorkspace.useQuery({ workspaceId }, { enabled: !!workspaceId });
    return { workspace, isLoading };
}

export function useUpdateWorkspace() {
    const utils = trpc.useUtils();
    const mutation = trpc.workspace.updateWorkspace.useMutation({ onSuccess: () => { utils.workspace.listWorkspaces.invalidate(); utils.workspace.getWorkspace.invalidate(); } });
    return { updateWorkspaceAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useDeleteWorkspace() {
    const utils = trpc.useUtils();
    const mutation = trpc.workspace.deleteWorkspace.useMutation({ onSuccess: () => { utils.workspace.listWorkspaces.invalidate(); } });
    return { deleteWorkspaceAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useInviteMember() {
    const utils = trpc.useUtils();
    const mutation = trpc.workspace.inviteMember.useMutation({ onSuccess: (_d, v) => { utils.workspace.listMembers.invalidate({ workspaceId: v.workspaceId }); } });
    return { inviteMemberAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useAcceptInvitation() {
    const utils = trpc.useUtils();
    const mutation = trpc.workspace.acceptInvitation.useMutation({ onSuccess: () => { utils.workspace.listWorkspaces.invalidate(); } });
    return { acceptInvitationAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useRemoveMember(workspaceId: string) {
    const utils = trpc.useUtils();
    const mutation = trpc.workspace.removeMember.useMutation({ onSuccess: () => { utils.workspace.listMembers.invalidate({ workspaceId }); } });
    return { removeMemberAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useUpdateMemberRole(workspaceId: string) {
    const utils = trpc.useUtils();
    const mutation = trpc.workspace.updateMemberRole.useMutation({ onSuccess: () => { utils.workspace.listMembers.invalidate({ workspaceId }); } });
    return { updateMemberRoleAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useListMembers(workspaceId: string) {
    const { data: members, isLoading } = trpc.workspace.listMembers.useQuery({ workspaceId }, { enabled: !!workspaceId });
    return { members, isLoading };
}

export function useLeaveWorkspace() {
    const utils = trpc.useUtils();
    const mutation = trpc.workspace.leaveWorkspace.useMutation({ onSuccess: () => { utils.workspace.listWorkspaces.invalidate(); } });
    return { leaveWorkspaceAsync: mutation.mutateAsync, isPending: mutation.isPending, error: mutation.error };
}

export function useListPendingInvitations(workspaceId: string) {
    const { data: invitations, isLoading } = trpc.workspace.listPendingInvitations.useQuery({ workspaceId }, { enabled: !!workspaceId });
    return { invitations, isLoading };
}

export function useRevokeInvitation(workspaceId: string) {
    const utils = trpc.useUtils();
    const mutation = trpc.workspace.revokeInvitation.useMutation({ onSuccess: () => { utils.workspace.listPendingInvitations.invalidate({ workspaceId }); } });
    return { revokeInvitationAsync: mutation.mutateAsync, isPending: mutation.isPending };
}
