// apps/web/app/page.tsx

"use client";

import { useHealth } from "~/hooks/api/health";
import { useUser } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { ThemeToggle } from "~/components/theme-toggle";
import { useRouter } from "next/navigation";

export default function Home() {
    const { data } = useHealth();
    const { data: user } = useUser();
    const router = useRouter();

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 text-center">
                <h1 className="text-3xl font-semibold">ChaiForms</h1>
                <p className="text-sm text-muted-foreground">Server Status: {data?.status}</p>

                <div className="flex justify-center gap-3">
                    {user?.id ? (
                        <Button onClick={() => router.push("/dashboard/forms")}>Dashboard</Button>
                    ) : (
                        <>
                            <Button onClick={() => router.push("/signin")}>Signin</Button>
                            <Button variant="outline" onClick={() => router.push("/signup")}>
                                Signup
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
