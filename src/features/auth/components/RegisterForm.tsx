import {Controller, useForm} from "react-hook-form";
import {PhoneInput} from "@/components/ui/phone-input";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AuthView} from "@/models/AuthView";
import {RegisterRequest} from "@/models/RegisterRequest";
import {useEffect, useRef, useState} from "react";
import {useThunk} from "@/lib/hooks/useThunk";
import {registerThunk} from "@/redux/auth/authThunk";
import {Checkbox} from "@/components/ui/checkbox";
import {AlertTriangle} from "lucide-react";
import {useIpDetails} from "@/lib/hooks/useIpDetails";
import {trackUserRegistered} from "@/lib/analytics";
import TermsOfService from "@/components/TermsOfService";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import {useDialog} from "@/components/providers/DialogProvider";
import {Turnstile, TurnstileInstance} from "@marsidev/react-turnstile";
import {emailValidationRules, passwordValidationRules, usernameValidationRules} from "@/features/auth/lib/validation";

interface RegisterFormData extends RegisterRequest {
    confirmPassword?: string;
}

export function RegisterForm({
                                 className,
                                 onAuthViewChange,
                                 ...props
                             }: React.ComponentPropsWithoutRef<"div"> & {
    onAuthViewChange?: (view: AuthView) => void;
}) {

    const {open} = useDialog();

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [runRegister, registerLoading, registerError] = useThunk(registerThunk);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const turnstileRef = useRef<TurnstileInstance>(null);

    const {ipDetails} = useIpDetails();
    const ipFlagged = ipDetails?.requiredVerification !== "NONE";

    const {
        register: formRegister,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: {errors, isSubmitting},
        reset,
    } = useForm<RegisterFormData>({
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            isOver18: false,
            isOverDigitalConsent: true,
            acceptsTermsAndPrivacy: false,
            phoneNumber: "",
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setError(null);
        setSuccess(null);
        try {
            const {confirmPassword, ...registerData} = data;
            const user = await runRegister({...registerData, captchaToken: captchaToken || undefined});
            try {
                if (user && typeof user.id !== "undefined") {
                    trackUserRegistered({user_id: String(user.id), method: "email"});
                }
            } catch {
            }
            reset();
            turnstileRef.current?.reset();
        } catch (e) {
            turnstileRef.current?.reset();
            setCaptchaToken(null);
            // ignore analytics on error
        }
    };

    const requiresPhone = ipDetails?.requiredVerification === "PHONE";
    const isOver18 = watch("isOver18");
    const password = watch("password");

    useEffect(() => {
        if (isOver18 && !watch("isOverDigitalConsent")) {
            setValue("isOverDigitalConsent", true);
        }
    }, [isOver18, setValue, watch]);

    return (
        <div className={cn("flex flex-col", className)} {...props}>
            <CardHeader>
                <CardTitle className="text-2xl">Register</CardTitle>
                <CardDescription>Create a new account.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                autoComplete="nickname"
                                {...formRegister("username", usernameValidationRules)}
                                disabled={isSubmitting}
                            />
                            {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                autoComplete="username"
                                {...formRegister("email", emailValidationRules)}
                                disabled={isSubmitting}
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                autoComplete="new-password"
                                {...formRegister("password", passwordValidationRules)}
                                disabled={isSubmitting}
                            />
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                {...formRegister("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: value => value === password || "Passwords do not match"
                                })}
                                disabled={isSubmitting}
                            />
                            {errors.confirmPassword &&
                                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                        </div>

                        {requiresPhone && (
                            <div className="grid gap-2 overflow-hidden">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Controller
                                    name="phoneNumber"
                                    control={control}
                                    rules={{
                                        required: "Phone number is required for verification",
                                        pattern: {
                                            value: /^\+?[1-9]\d{6,14}$/,
                                            message: "Enter a valid phone number",
                                        },
                                    }}
                                    render={({field}) => (
                                        <PhoneInput
                                            defaultCountry="us"
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={isSubmitting}
                                            className="w-full max-w-full"
                                        />
                                    )}
                                />
                                {errors.phoneNumber && (
                                    <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                                )}
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <div className="hidden">
                                <Controller
                                    name="isOverDigitalConsent"
                                    control={control}
                                    rules={{
                                        required: "You must be over the age of digital consent to create an account",
                                    }}
                                    render={({field}) => (
                                        <Checkbox
                                            id="isOverDigitalConsent"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                />
                                <Label htmlFor="isOverDigitalConsent" className="cursor-pointer text-sm">
                                    I am over the age of digital consent in my country
                                </Label>
                            </div>
                            {errors.isOverDigitalConsent && (
                                <p className="text-sm text-red-500">{errors.isOverDigitalConsent.message}</p>
                            )}

                            <div className="flex items-center gap-2">
                                <Controller
                                    name="isOver18"
                                    control={control}
                                    rules={{
                                        required: "You must be 18 or older to register",
                                    }}
                                    render={({field}) => (
                                        <Checkbox
                                            id="isOver18"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                />
                                <Label htmlFor="isOver18" className="cursor-pointer text-sm">
                                    I am over 18
                                </Label>
                            </div>
                            {errors.isOver18 && (
                                <p className="text-sm text-red-500">{errors.isOver18.message}</p>
                            )}

                            <div className="flex items-center gap-2">
                                <Controller
                                    name="acceptsTermsAndPrivacy"
                                    control={control}
                                    rules={{
                                        required: "You must accept the Terms of Service and Privacy Policy",
                                    }}
                                    render={({field}) => (
                                        <Checkbox
                                            id="acceptsTermsAndPrivacy"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                />
                                <Label htmlFor="acceptsTermsAndPrivacy" className="cursor-pointer text-sm">
                                    I accept the{" "}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            open(<div className="max-w-4xl "><TermsOfService/></div>);
                                        }}
                                        className="underline underline-offset-4 hover:text-primary"
                                    >
                                        Terms of Service
                                    </button>
                                    {" "}and{" "}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            open(<div className="max-w-4xl"><PrivacyPolicy/></div>);
                                        }}
                                        className="underline underline-offset-4 hover:text-primary"
                                    >
                                        Privacy Policy
                                    </button>
                                </Label>
                            </div>
                            {errors.acceptsTermsAndPrivacy && (
                                <p className="text-sm text-red-500">{errors.acceptsTermsAndPrivacy.message}</p>
                            )}
                        </div>
                        {error && <p className="text-center text-sm text-red-500">{error}</p>}
                        {success && <p className="text-center text-sm text-green-600">{success}</p>}
                        <div className="flex justify-center">
                            <Turnstile
                                ref={turnstileRef}
                                siteKey="0x4AAAAAACXsJ_rq89s_WjsD"
                                onSuccess={setCaptchaToken}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Registering..." : "Register"}
                        </Button>
                        {registerError && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4"/>
                                <AlertDescription className="m-0 p-0">
                                    {registerError.message || "Registration failed. Please try again."}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <a
                            href="#"
                            className="underline underline-offset-4"
                            onClick={(e) => {
                                e.preventDefault();
                                onAuthViewChange?.(AuthView.LOGIN);
                            }}
                        >
                            Login
                        </a>
                    </div>

                    {!ipFlagged && (
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
