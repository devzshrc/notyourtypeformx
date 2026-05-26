// apps/web/app/signup/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useSignup } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function SignupPage() {
    const router = useRouter();
    const { createUserWithEmailAndPasswordAsync, isPending, isSuccess, error } = useSignup();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await createUserWithEmailAndPasswordAsync({
            fullName,
            email,
            password,
        });

        router.push("/dashboard/forms");
    };

    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur"
            >
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
                    <p className="text-sm text-white/60">
                        Register with your name, email, and password.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                        id="fullName"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Jane Doe"
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/30"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="jane@example.com"
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/30"
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
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/30"
                    />
                </div>

                {error ? <p className="text-sm text-red-400">{error.message}</p> : null}
                {isSuccess ? <p className="text-sm text-emerald-400">Account created.</p> : null}

                <Button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-white/90"
                    disabled={isPending}
                >
                    {isPending ? "Registering..." : "Register"}
                </Button>
            </form>
        </main>
    );
}