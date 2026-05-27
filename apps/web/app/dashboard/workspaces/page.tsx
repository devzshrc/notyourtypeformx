"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useListWorkspaces, useCreateWorkspace, useDeleteWorkspace, useLeaveWorkspace, useListMembers, useInviteMember, useRemoveMember, useUpdateMemberRole, useListPendingInvitations, useRevokeInvitation, useUpdateWorkspace } from "~/hooks/api/workspace";
import { useListWorkspaceForms } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "~/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "~/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Plus, Users, Trash2, Copy, CheckCircle, Link as LinkIcon, LogOut, AlertCircle, FileText, Settings, ArrowLeft, PencilLine, Eye, Shield, Crown, Edit3, EyeIcon } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function robohash(email: string, size = 80) {
    return `https://robohash.org/${encodeURIComponent(email)}?size=${size}x${size}&set=set4`;
}

function canManageMembers(role: string) { return role === "OWNER" || role === "ADMIN"; }

function roleIcon(role: string) {
    if (role === "OWNER") return <Crown className="size-3 text-amber-500" />;
    if (role === "ADMIN") return <Shield className="size-3 text-blue-500" />;
    if (role === "EDITOR") return <Edit3 className="size-3 text-green-500" />;
    return <EyeIcon className="size-3 text-muted-foreground" />;
}

function roleColor(role: string) {
    if (role === "OWNER") return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    if (role === "ADMIN") return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    if (role === "EDITOR") return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    return "bg-muted text-muted-foreground border-border";
}

function ErrorMessage({ error }: { error: { message: string } | null }) {
    if (!error) return null;
    return (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />{error.message}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WorkspacesPage() {
    const { workspaces, isLoading } = useListWorkspaces();
    const { createWorkspaceAsync, isPending: creating, error: createError } = useCreateWorkspace();
    const { deleteWorkspaceAsync, isPending: deleting } = useDeleteWorkspace();
    const { leaveWorkspaceAsync, isPending: leaving } = useLeaveWorkspace();
    const [name, setName] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedWs, setSelectedWs] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!name.trim()) return;
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
        if (slug.length < 3) return;
        try {
            await createWorkspaceAsync({ name: name.trim(), slug });
            setName("");
            setCreateOpen(false);
        } catch {
            /* error surfaced via mutation toast */
        }
    };

    const selectedWorkspace = workspaces?.find((ws) => ws.id === selectedWs);

    if (isLoading) {
        return (
            <div className="p-6 md:p-8 max-w-4xl mx-auto">
                <div className="space-y-4">
                    <div className="h-8 w-40 rounded-lg bg-muted/60 animate-pulse" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[1, 2].map((i) => <div key={i} className="h-32 rounded-xl bg-muted/40 animate-pulse" />)}
                    </div>
                </div>
            </div>
        );
    }

    if (selectedWorkspace) {
        return (
            <WorkspaceDetail
                workspace={selectedWorkspace}
                onBack={() => setSelectedWs(null)}
                onDelete={async () => { await deleteWorkspaceAsync({ workspaceId: selectedWorkspace.id }); setSelectedWs(null); }}
                onLeave={async () => { await leaveWorkspaceAsync({ workspaceId: selectedWorkspace.id }); setSelectedWs(null); }}
                deleting={deleting}
                leaving={leaving}
            />
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Collaborate with your team on forms</p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-1.5"><Plus className="size-4" /> New Workspace</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create Workspace</DialogTitle>
                            <DialogDescription>Give your workspace a name. You can invite team members after creating it.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Input placeholder="e.g. Marketing Team" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} autoFocus className="h-10" />
                                {name.trim() && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <LinkIcon className="size-3" /> schema.app/{name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80)}
                                    </p>
                                )}
                            </div>
                            <ErrorMessage error={createError} />
                            <Button onClick={handleCreate} disabled={creating || name.trim().length < 1} className="w-full">{creating ? "Creating..." : "Create Workspace"}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {workspaces && workspaces.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 overflow-hidden">
                    {workspaces.map((ws) => <WorkspaceCard key={ws.id} workspace={ws} onClick={() => setSelectedWs(ws.id)} />)}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 py-16 px-6">
                    <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <Users className="size-6 text-primary" />
                    </div>
                    <p className="font-medium">No workspaces yet</p>
                    <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">Create a workspace to start collaborating with your team on forms.</p>
                    <Button size="sm" className="mt-4 gap-1.5" onClick={() => setCreateOpen(true)}><Plus className="size-4" /> Create your first workspace</Button>
                </div>
            )}
        </div>
    );
}

// ─── Workspace Card ───────────────────────────────────────────────────────────

function WorkspaceCard({ workspace, onClick }: { workspace: { id: string; name: string; slug: string; role: string }; onClick: () => void }) {
    const { forms, isLoading } = useListWorkspaceForms(workspace.id);
    const { members } = useListMembers(workspace.id);
    const formCount = forms?.length ?? 0;
    const memberCount = members?.length ?? 0;

    return (
        <div
            onClick={onClick}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card p-5 transition-shadow duration-200 hover:shadow-md"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                        {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{workspace.name}</h3>
                        <p className="text-xs text-muted-foreground">/{workspace.slug}</p>
                    </div>
                </div>
                <Badge variant="outline" className={`text-xs border ${roleColor(workspace.role)}`}>
                    {roleIcon(workspace.role)}
                    <span className="ml-1">{workspace.role}</span>
                </Badge>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="size-3.5" />
                        {isLoading ? "…" : formCount} form{formCount !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="size-3.5" />
                        {memberCount} member{memberCount !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Stacked member avatars */}
                {members && members.length > 0 && (
                    <div className="flex -space-x-2">
                        {members.slice(0, 4).map((m) => (
                            <Image key={m.id} src={robohash(m.email)} alt={m.fullName ?? ""} width={24} height={24} className="size-6 rounded-full border-2 border-card bg-muted" unoptimized />
                        ))}
                        {members.length > 4 && (
                            <div className="flex size-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium text-muted-foreground">
                                +{members.length - 4}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Workspace Detail ─────────────────────────────────────────────────────────

function WorkspaceDetail({ workspace, onBack, onDelete, onLeave, deleting, leaving }: {
    workspace: { id: string; name: string; slug: string; role: string };
    onBack: () => void;
    onDelete: () => void;
    onLeave: () => void;
    deleting: boolean;
    leaving: boolean;
}) {
    const isOwnerOrAdmin = canManageMembers(workspace.role);
    const { members } = useListMembers(workspace.id);
    const { forms } = useListWorkspaceForms(workspace.id);

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="size-9 shrink-0" onClick={onBack}>
                    <ArrowLeft className="size-4" />
                </Button>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary shrink-0">
                        {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold truncate">{workspace.name}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-muted-foreground">/{workspace.slug}</p>
                            <Badge variant="outline" className={`text-xs border ${roleColor(workspace.role)}`}>
                                {roleIcon(workspace.role)}
                                <span className="ml-1">{workspace.role}</span>
                            </Badge>
                        </div>
                    </div>
                </div>
                {/* Quick stats */}
                <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><FileText className="size-3.5" />{forms?.length ?? 0}</span>
                    <span className="flex items-center gap-1"><Users className="size-3.5" />{members?.length ?? 0}</span>
                </div>
            </div>

            <Tabs defaultValue="forms" className="space-y-4">
                <TabsList className="bg-muted/50">
                    <TabsTrigger value="forms" className="gap-1.5 data-[state=active]:bg-background"><FileText className="size-3.5" />Forms</TabsTrigger>
                    <TabsTrigger value="members" className="gap-1.5 data-[state=active]:bg-background"><Users className="size-3.5" />Members</TabsTrigger>
                    {isOwnerOrAdmin && <TabsTrigger value="settings" className="gap-1.5 data-[state=active]:bg-background"><Settings className="size-3.5" />Settings</TabsTrigger>}
                </TabsList>

                <TabsContent value="forms"><WorkspaceForms workspaceId={workspace.id} /></TabsContent>
                <TabsContent value="members"><WorkspaceMembers workspaceId={workspace.id} role={workspace.role} /></TabsContent>
                {isOwnerOrAdmin && <TabsContent value="settings"><WorkspaceSettings workspace={workspace} onDelete={onDelete} onLeave={onLeave} deleting={deleting} leaving={leaving} /></TabsContent>}
            </Tabs>
        </div>
    );
}

// ─── Forms Tab ────────────────────────────────────────────────────────────────

function WorkspaceForms({ workspaceId }: { workspaceId: string }) {
    const { forms, isLoading } = useListWorkspaceForms(workspaceId);

    if (isLoading) return <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-[68px] rounded-xl bg-muted/40 animate-pulse" />)}</div>;

    if (!forms?.length) {
        return (
            <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-border/60 py-12 px-6">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 mb-3">
                    <FileText className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No forms yet</p>
                <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">Go to the Forms page and create a form with this workspace selected, or move an existing form here.</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link href="/dashboard/forms">Go to Forms</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {forms.map((form) => {
                const isLive = form.status === "PUBLISHED";
                return (
                    <div key={form.id} className="group flex items-center justify-between rounded-xl border border-border/60 px-4 py-3.5 transition-all hover:border-primary/30 hover:shadow-sm">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${isLive ? "bg-green-500/10" : "bg-muted/60"}`}>
                                <FileText className={`size-3.5 ${isLive ? "text-green-600" : "text-muted-foreground"}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-medium truncate">{form.title}</h3>
                                    <div className={`size-1.5 shrink-0 rounded-full ${isLive ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                                    <Badge variant={isLive ? "default" : "secondary"} className="text-[10px] py-0 px-1.5">
                                        {isLive ? "Live" : "Draft"}
                                    </Badge>
                                    {form.isArchived && <Badge variant="outline" className="text-[10px] py-0 px-1.5">Archived</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{form.description || "No description"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TooltipProvider delayDuration={300}>
                                <Tooltip><TooltipTrigger asChild><Button asChild variant="ghost" size="icon" className="size-8"><Link href={`/form/${form.id}/submissions`}><Eye className="size-3.5" /></Link></Button></TooltipTrigger><TooltipContent side="bottom"><p className="text-xs">Submissions</p></TooltipContent></Tooltip>
                                <Tooltip><TooltipTrigger asChild><Button asChild variant="ghost" size="icon" className="size-8"><Link href={`/dashboard/forms/${form.id}`}><PencilLine className="size-3.5" /></Link></Button></TooltipTrigger><TooltipContent side="bottom"><p className="text-xs">Edit</p></TooltipContent></Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Members Tab ──────────────────────────────────────────────────────────────

function WorkspaceMembers({ workspaceId, role }: { workspaceId: string; role: string }) {
    const { members, isLoading } = useListMembers(workspaceId);
    const { inviteMemberAsync, isPending: inviting } = useInviteMember();
    const { removeMemberAsync } = useRemoveMember(workspaceId);
    const { updateMemberRoleAsync } = useUpdateMemberRole(workspaceId);
    const [email, setEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"ADMIN" | "EDITOR" | "VIEWER">("EDITOR");
    const [lastInviteToken, setLastInviteToken] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    const isAdmin = canManageMembers(role);

    const handleInvite = useCallback(async () => {
        if (!email.trim()) return;
        setLocalError(null);
        setLastInviteToken(null);
        try {
            const result = await inviteMemberAsync({ workspaceId, email: email.trim(), role: inviteRole });
            setLastInviteToken(result.token);
            setEmail("");
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : "Failed to send invitation");
        }
    }, [email, inviteRole, workspaceId, inviteMemberAsync]);

    if (isLoading) return <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />)}</div>;

    return (
        <div className="space-y-5">
            {/* Permission legend */}
            <div className="flex flex-wrap gap-3 rounded-lg bg-muted/30 px-4 py-2.5">
                <span className="flex items-center gap-1.5 text-xs"><Crown className="size-3 text-amber-500" />Owner — Full control</span>
                <span className="flex items-center gap-1.5 text-xs"><Shield className="size-3 text-blue-500" />Admin — Manage members</span>
                <span className="flex items-center gap-1.5 text-xs"><Edit3 className="size-3 text-green-500" />Editor — Edit forms</span>
                <span className="flex items-center gap-1.5 text-xs"><EyeIcon className="size-3 text-muted-foreground" />Viewer — View only</span>
            </div>

            {/* Invite form */}
            {isAdmin && (
                <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Invite a team member</p>
                    <div className="flex gap-2">
                        <Input placeholder="colleague@company.com" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setLocalError(null); setLastInviteToken(null); }} className="flex-1 h-9" onKeyDown={(e) => e.key === "Enter" && handleInvite()} />
                        <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as typeof inviteRole)}>
                            <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="EDITOR">Editor</SelectItem>
                                <SelectItem value="VIEWER">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleInvite} disabled={inviting || !email.trim()} size="sm" className="h-9 px-4">{inviting ? "Sending..." : "Invite"}</Button>
                    </div>
                    {localError && <ErrorMessage error={{ message: localError }} />}
                    {lastInviteToken && <InviteLinkDisplay token={lastInviteToken} />}
                </div>
            )}

            {/* Members list */}
            <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">{members?.length ?? 0} member{(members?.length ?? 0) !== 1 ? "s" : ""}</p>
                {members?.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3 transition-colors hover:bg-muted/20">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Image src={robohash(m.email)} alt="" width={36} height={36} className="size-9 rounded-full bg-muted ring-2 ring-background" unoptimized />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{m.fullName}</p>
                                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                            {m.role === "OWNER" ? (
                                <Badge variant="outline" className={`text-xs border gap-1 ${roleColor("OWNER")}`}>
                                    <Crown className="size-3" /> Owner
                                </Badge>
                            ) : isAdmin ? (
                                <>
                                    <Select value={m.role} onValueChange={(v) => updateMemberRoleAsync({ workspaceId, memberId: m.id, role: v as "ADMIN" | "EDITOR" | "VIEWER" })}>
                                        <SelectTrigger className="h-7 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN"><span className="flex items-center gap-1.5"><Shield className="size-3 text-blue-500" />Admin</span></SelectItem>
                                            <SelectItem value="EDITOR"><span className="flex items-center gap-1.5"><Edit3 className="size-3 text-green-500" />Editor</span></SelectItem>
                                            <SelectItem value="VIEWER"><span className="flex items-center gap-1.5"><EyeIcon className="size-3 text-muted-foreground" />Viewer</span></SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Remove {m.fullName}?</AlertDialogTitle>
                                                <AlertDialogDescription>They will lose access to all workspace forms. They&apos;ll need a new invitation to rejoin.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => removeMemberAsync({ workspaceId, memberId: m.id })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            ) : (
                                <Badge variant="outline" className={`text-xs border gap-1 ${roleColor(m.role)}`}>
                                    {roleIcon(m.role)} {m.role}
                                </Badge>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pending invitations */}
            {isAdmin && <PendingInvitations workspaceId={workspaceId} />}
        </div>
    );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function WorkspaceSettings({ workspace, onDelete, onLeave, deleting, leaving }: {
    workspace: { id: string; name: string; slug: string; role: string };
    onDelete: () => void;
    onLeave: () => void;
    deleting: boolean;
    leaving: boolean;
}) {
    const { updateWorkspaceAsync, isPending: updating, error: updateError } = useUpdateWorkspace();
    const [wsName, setWsName] = useState(workspace.name);

    const handleSave = async () => {
        if (!wsName.trim() || wsName.trim() === workspace.name) return;
        await updateWorkspaceAsync({ workspaceId: workspace.id, name: wsName.trim() });
    };

    return (
        <div className="space-y-8 max-w-lg">
            {/* General */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold">General</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Manage your workspace identity</p>
                </div>
                <div className="space-y-2 rounded-xl border border-border/60 p-4">
                    <label className="text-xs font-medium text-muted-foreground">Workspace Name</label>
                    <div className="flex gap-2">
                        <Input value={wsName} onChange={(e) => setWsName(e.target.value)} className="h-9" onKeyDown={(e) => e.key === "Enter" && handleSave()} />
                        <Button onClick={handleSave} disabled={updating || wsName.trim() === workspace.name} size="sm" className="h-9 px-4">{updating ? "Saving..." : "Save"}</Button>
                    </div>
                    {updateError && <ErrorMessage error={updateError} />}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Irreversible actions</p>
                </div>
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
                    {workspace.role === "OWNER" ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Delete workspace</p>
                                <p className="text-xs text-muted-foreground">Remove all members. Forms will become personal.</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm"><Trash2 className="mr-1.5 size-3.5" /> Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete &ldquo;{workspace.name}&rdquo;?</AlertDialogTitle>
                                        <AlertDialogDescription>This will remove all members and detach all forms. Forms won&apos;t be deleted but will become personal. This cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={onDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleting ? "Deleting..." : "Delete Workspace"}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Leave workspace</p>
                                <p className="text-xs text-muted-foreground">You&apos;ll lose access to all workspace forms.</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm"><LogOut className="mr-1.5 size-3.5" /> Leave</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Leave &ldquo;{workspace.name}&rdquo;?</AlertDialogTitle>
                                        <AlertDialogDescription>You&apos;ll need a new invitation to rejoin.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={onLeave} disabled={leaving}>{leaving ? "Leaving..." : "Leave Workspace"}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Invite Link Display ──────────────────────────────────────────────────────

function InviteLinkDisplay({ token }: { token: string }) {
    const [copied, setCopied] = useState(false);
    const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${token}`;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                <CheckCircle className="size-3.5" /> Invite link ready
            </div>
            <p className="text-xs text-muted-foreground">Share this link with your teammate. It expires in 7 days.</p>
            <div className="flex gap-2">
                <Input readOnly value={inviteUrl} className="text-xs font-mono h-8 flex-1 select-all bg-background" onFocus={(e) => e.target.select()} />
                <Button size="sm" variant="outline" className="h-8 shrink-0 gap-1.5" onClick={handleCopy}>
                    {copied ? <CheckCircle className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                </Button>
            </div>
        </div>
    );
}

// ─── Pending Invitations ──────────────────────────────────────────────────────

function PendingInvitations({ workspaceId }: { workspaceId: string }) {
    const { invitations, isLoading } = useListPendingInvitations(workspaceId);
    const { revokeInvitationAsync } = useRevokeInvitation(workspaceId);

    if (isLoading || !invitations?.length) return null;

    return (
        <div className="space-y-2 pt-4 border-t border-border/60">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Pending Invitations ({invitations.length})</p>
            {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-xl border border-dashed border-border/60 px-4 py-2.5">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Image src={robohash(inv.email)} alt="" width={28} height={28} className="size-7 rounded-full bg-muted opacity-40" unoptimized />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm truncate">{inv.email}</p>
                            <p className="text-xs text-muted-foreground">
                                {inv.role} · expires {new Date(inv.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => revokeInvitationAsync({ invitationId: inv.id, workspaceId })}>
                        Revoke
                    </Button>
                </div>
            ))}
        </div>
    );
}
