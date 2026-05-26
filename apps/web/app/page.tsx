// apps/web/app/page.tsx

"use client";

import { useHealth } from "~/hooks/api/health";
import { useUser } from "~/hooks/api/auth";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
    const { data } = useHealth();
    const { data: user } = useUser();
    const router = useRouter();

    console.log(user);

    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <h1 className="text-3xl font-semibold">ChaiForms</h1>
                <p className="text-sm text-white/60">Server Status: {data?.status}</p>

                <div className="flex gap-3 justify-center">
                    {user?.id ? (
                        <Button
                            onClick={() => router.push("/dashboard/forms")}
                            className="bg-white text-black"
                        >
                            Dashboard
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={() => router.push("/signin")}
                                className="bg-white text-black"
                            >
                                Signin
                            </Button>
                            <Button
                                onClick={() => router.push("/signup")}
                                className="bg-white text-black"
                            >
                                Signup
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
