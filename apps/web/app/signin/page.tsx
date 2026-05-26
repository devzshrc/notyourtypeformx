"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignin } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function SigninPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const { signInUserWithEmailAndPasswordAsync, error, isPending } = useSignin();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await signInUserWithEmailAndPasswordAsync({ email, password });
            router.push("/dashboard");
        } catch {
            // error is handled by the hook
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <Link href="/" className="text-2xl font-bold">ChaiForms</Link>
                    <h1 className="mt-4 text-xl font-semibold">Sign in to your account</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Enter your credentials below</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    {error && <p className="text-sm text-destructive" role="alert">{error.message}</p>}
                    <Button type="submit" className="w-full" disabled={isPending}>{isPending ? "Signing in..." : "Sign in"}</Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="font-medium text-primary hover:underline">Sign up</Link>
                </p>
            </div>
        </main>
    );
}
