"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAcceptInvitation } from "~/hooks/api/workspace";
import { useUser } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CheckCircle, Users, AlertCircle, Loader2 } from "~/components/icons";
import Link from "next/link";

export default function AcceptInvitePage() {
    const { token } = useParams<{ token: string }>();
    const router = useRouter();
    const { data: user, isLoading: userLoading } = useUser();
    const { acceptInvitationAsync, isPending } = useAcceptInvitation();
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleAccept = async () => {
        if (!token) return;
        try {
            await acceptInvitationAsync({ token });
            setStatus("success");
            setTimeout(() => router.push("/dashboard/workspaces"), 1500);
        } catch (err) {
            setStatus("error");
            setErrorMessage(err instanceof Error ? err.message : "Failed to accept invitation");
        }
    };

    // Loading user state
    if (userLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Not logged in — show sign in / sign up options with redirect back
    if (!user?.id) {
        const returnPath = encodeURIComponent(`/invite/${token}`);
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center pb-4">
                        <Users className="mx-auto size-10 text-primary mb-3" />
                        <CardTitle className="text-xl">Workspace Invitation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <p className="text-sm text-muted-foreground">Sign in or create an account to accept this invitation.</p>
                        <div className="flex flex-col gap-2">
                            <Button asChild className="w-full">
                                <Link href={`/signin?redirect=${returnPath}`}>Sign In</Link>
                            </Button>
                            <Button variant="outline" asChild className="w-full">
                                <Link href={`/signup?redirect=${returnPath}`}>Create Account</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Logged in — show accept UI
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center pb-4">
                    {status === "success" && <CheckCircle className="mx-auto size-10 text-green-500 mb-3" />}
                    {status === "error" && <AlertCircle className="mx-auto size-10 text-destructive mb-3" />}
                    {status === "idle" && <Users className="mx-auto size-10 text-primary mb-3" />}
                    <CardTitle className="text-xl">
                        {status === "success" ? "You're in!" : status === "error" ? "Something went wrong" : "Workspace Invitation"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    {status === "idle" && (
                        <>
                            <p className="text-sm text-muted-foreground">
                                You&apos;ve been invited to join a workspace as <span className="font-medium text-foreground">{user.email}</span>.
                            </p>
                            <Button onClick={handleAccept} disabled={isPending} className="w-full">
                                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                                {isPending ? "Accepting..." : "Accept Invitation"}
                            </Button>
                        </>
                    )}
                    {status === "success" && (
                        <p className="text-sm text-muted-foreground">Redirecting to your workspaces...</p>
                    )}
                    {status === "error" && (
                        <>
                            <p className="text-sm text-destructive">{errorMessage}</p>
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" onClick={() => setStatus("idle")} className="w-full">Try Again</Button>
                                <Button variant="ghost" asChild className="w-full">
                                    <Link href="/dashboard/workspaces">Go to Workspaces</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
