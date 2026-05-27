"use client";

import { useListWorkspaces } from "~/hooks/api/workspace";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Building2 } from "lucide-react";

interface Props {
    value: string | undefined;
    onChange: (id: string | undefined) => void;
}

export function WorkspaceSelector({ value, onChange }: Props) {
    const { workspaces, isLoading } = useListWorkspaces();

    if (isLoading) return null;
    if (!workspaces?.length) return null;

    return (
        <div className="px-3 pb-2">
            <Select value={value ?? "__personal"} onValueChange={(v) => onChange(v === "__personal" ? undefined : v)}>
                <SelectTrigger className="h-8 text-xs">
                    <Building2 className="mr-1.5 size-3 text-muted-foreground" />
                    <SelectValue placeholder="Personal" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="__personal">Personal</SelectItem>
                    {workspaces.map((ws) => (
                        <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
