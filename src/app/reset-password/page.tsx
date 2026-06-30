'use client'
import {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {useForm} from "react-hook-form";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Eye, EyeOff} from "lucide-react";
import {resetPasswordThunk} from "@/redux/auth/authThunk";
import {AppDispatch} from "@/redux/store";
import {ROUTES} from "@/routes";
import {passwordValidationRules} from "@/features/auth/lib/validation";
import {useThemedLogo} from "@/lib/hooks/useThemedLogo";

type ResetPasswordFormValues = {
    password: string;
    confirmPassword: string;
};

export default function ResetPasswordPage() {
    const [token, setToken] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">("");

    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const logoSrc = useThemedLogo();
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: {errors, isSubmitting},
    } = useForm<ResetPasswordFormValues>({
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const password = watch("password");

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get("token");
        if (tokenParam) {
            setToken(tokenParam);
        }
    }, []);

    const onSubmit = async (values: ResetPasswordFormValues) => {
        if (!token) {
            setMessage("Invalid or missing reset token");
            setMessageType("error");
            return;
        }

        setMessage("");

        try {
            await dispatch(resetPasswordThunk({token, newPassword: values.password})).unwrap();

            setMessage("Password reset successfully! Redirecting to login...");
            setMessageType("success");
            reset();

            setTimeout(() => {
                router.push(ROUTES.LOGIN);
            }, 1500);
        } catch (error: unknown) {
            setMessage(getErrorMessage(error));
            setMessageType("error");
        }
    };

    return (
        <div className="flex min-h-full items-center justify-center py-10">
            <div className="flex w-full max-w-[450px] flex-col items-center gap-8 px-4">
                <Card className="w-full overflow-hidden pt-6">
                    <div className="flex flex-col items-center gap-2">
                        <Image
                            src={logoSrc}
                            alt="Logo"
                            width={120}
                            height={48}
                            priority
                            className="h-12 w-auto"
                        />
                        <p className="text-sm text-muted-foreground">
                            For all conversations.
                        </p>
                    </div>
                    <CardHeader>
                        <CardTitle className="text-2xl">Reset password</CardTitle>
                        <CardDescription>
                            Choose a new password for your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your new password"
                                            autoComplete="new-password"
                                            className="pr-10"
                                            disabled={isSubmitting}
                                            {...register("password", passwordValidationRules)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-500">{errors.password.message}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm your new password"
                                            autoComplete="new-password"
                                            className="pr-10"
                                            disabled={isSubmitting}
                                            {...register("confirmPassword", {
                                                required: "Please confirm your password",
                                                validate: value => value === password || "Passwords do not match",
                                            })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                {message && (
                                    <Alert
                                        className={messageType === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                                        <AlertDescription
                                            className={messageType === "success" ? "text-green-800" : "text-red-800"}>
                                            {message}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting || !token}
                                >
                                    {isSubmitting ? "Resetting..." : "Reset Password"}
                                </Button>

                                {!token && (
                                    <Alert className="border-yellow-200 bg-yellow-50">
                                        <AlertDescription className="text-yellow-800">
                                            No reset token found. Please use the link from your email or verify your
                                            phone reset code.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <div className="mt-4 text-center text-sm">
                                Remembered your password?{" "}
                                <button
                                    type="button"
                                    className="underline underline-offset-4"
                                    onClick={() => router.push(ROUTES.LOGIN)}
                                >
                                    Login
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function getErrorMessage(error: unknown) {
    if (typeof error === "string") {
        return error;
    }

    if (error && typeof error === "object" && "message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string") {
            return message;
        }
    }

    return "Failed to reset password. Please try again.";
}
