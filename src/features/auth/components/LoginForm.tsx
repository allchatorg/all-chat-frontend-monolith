"use client";
import {useForm} from "react-hook-form";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {AuthView} from "@/models/AuthView";
import {LoginRequest} from "@/models/LoginRequest";
import {useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {fetchMe} from "@/redux/user/usersThunk";
import {loginThunk} from "@/redux/auth/authThunk";
import {trackUserLoggedIn} from "@/lib/analytics";
import {useThunk} from "@/lib/hooks/useThunk";
import {emailValidationRules} from "@/features/auth/lib/validation";
import {sanitizeRedirectParam} from "@/routes";

export function LoginForm({
                              className,
                              onAuthViewChange,
                              flaggedIp,
                              ...props
                          }: React.ComponentPropsWithoutRef<"div"> & {
    onAuthViewChange?: (view: AuthView) => void;
    flaggedIp?: boolean;
}) {
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    const [runLogin, loginLoading, loginError] = useThunk(loginThunk);
    const [runFetchMe] = useThunk(fetchMe);

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginRequest>();

    const onSubmit = async (data: LoginRequest) => {
        setError("");
        const user = await runLogin(data);
        if (!user) {
            setError(loginError?.message || "Login failed. Please try again.");
            return;
        }
        try {
            if (user && typeof user.id !== "undefined") {
                trackUserLoggedIn({user_id: String(user.id), method: "email"});
            }
        } catch {
        }
        await runFetchMe();
        router.push(sanitizeRedirectParam(searchParams.get("redirect")) ?? "/");
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        setError("");
        onAuthViewChange?.(AuthView.FORGOT_PASSWORD);
    };

    return (
        <div className={cn("flex flex-col", className)} {...props}>
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>Access your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                autoComplete="username"
                                {...register("email", emailValidationRules)}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <a
                                    href="#"
                                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    onClick={handleForgotPassword}
                                >
                                    Forgot your password?
                                </a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters long",
                                    },
                                    maxLength: {
                                        value: 32,
                                        message: "Password must be at most 32 characters long",
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
                                        message:
                                            "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                                    },
                                })}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {(error || loginError) && (
                            <p className="text-center text-sm text-red-500">{error || loginError?.message}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={loginLoading}>
                            {loginLoading ? "Logging in..." : "Login"}
                        </Button>
                    </div>

                    <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <a
                            href="#"
                            className="underline underline-offset-4"
                            onClick={(e) => {
                                e.preventDefault();
                                onAuthViewChange?.(AuthView.REGISTER);
                            }}
                        >
                            Sign up
                        </a>
                    </div>

                    {!flaggedIp && (
                        <div className="mt-4 text-center text-sm">
                            Want to chat without signing up?{" "}
                            <a
                                href="#"
                                className="underline underline-offset-4"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onAuthViewChange?.(AuthView.REGISTER_ANONYMOUS);
                                }}
                            >
                                Create a throwaway account
                            </a>
                        </div>
                    )}
                </form>
            </CardContent>
        </div>
    );
}
