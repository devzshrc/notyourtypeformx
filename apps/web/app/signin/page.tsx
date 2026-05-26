// apps/web/app/signin/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useSignin } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function SigninPage() {
    const router = useRouter();
    const { signInUserWithEmailAndPasswordAsync, isPending, isSuccess, error } = useSignin();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await signInUserWithEmailAndPasswordAsync({
            email,
            password,
        });

        router.push("/dashboard/forms");
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email and password to continue.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="jane@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                    />
                </div>

                {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
                {isSuccess ? <p className="text-sm text-green-500">Signed in.</p> : null}

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Signing in..." : "Sign in"}
                </Button>
            </form>
        </main>
    );
}