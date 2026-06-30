import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Controller, useForm} from "react-hook-form";
import {AuthView} from "../../../models/AuthView";
import {useEffect, useRef, useState} from "react";
import {UnclaimedRegister} from "@/models/UnclaimedRegister";
import {useRouter} from "next/navigation";
import {useThunk} from "@/lib/hooks/useThunk";
import {registerUnclaimedThunk} from "@/redux/auth/authThunk";
import {AlertTriangle} from "lucide-react";
import {ROUTES} from "@/routes";
import {trackUserRegisteredAnonymous} from "@/lib/analytics";
import {getSessionToken} from "@/lib/tokenManager";
import {useDialog} from "@/components/providers/DialogProvider";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import TermsOfService from "@/components/TermsOfService";
import {Turnstile, TurnstileInstance} from '@marsidev/react-turnstile'

interface ApiError {
    status: number;
    error: string;
    message: string;
    timestamp: string;
}

export function RegisterAnonymousForm({
                                          className,
                                          onStartChat,
                                          onAuthViewChange,
                                          flaggedIp,
                                          ...props
                                      }: React.ComponentPropsWithoutRef<"div"> & {
    onStartChat?: (username: string) => void,
    onAuthViewChange?: (view: AuthView) => void,
    flaggedIp?: boolean
}) {
    const router = useRouter();
    const {open, close} = useDialog();
    const [error, setError] = useState<string | null>(null);
    const [runRegisterUnclaimed, registerUnclaimedIsLoading, registerUnclaimedError] = useThunk(registerUnclaimedThunk);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const turnstileRef = useRef<TurnstileInstance>(null);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: {errors, isSubmitting},
        reset,
    } = useForm<UnclaimedRegister>({
        defaultValues: {
            isOver18: false,
            isOverDigitalConsent: true,
            acceptsTermsAndPrivacy: false,
        },
    });

    const onSubmit = async (data: UnclaimedRegister) => {
        setError(null);
        try {
            await runRegisterUnclaimed({...data, captchaToken: captchaToken || undefined})
            try {
                const token = getSessionToken();
                if (token?.token) {
                    trackUserRegisteredAnonymous({session_id: token.token});
                }
            } catch {
            }
            router.push("/");
            reset();
            turnstileRef.current?.reset();
            onStartChat?.(data.username);
        } catch (err: any) {
            turnstileRef.current?.reset();
            setCaptchaToken(null);
            const errorMessage = err?.response?.data?.message ||
                registerUnclaimedError?.message ||
                "Failed to start chat.";
            setError(errorMessage);
        }
    };

    if (flaggedIp) {
        router.push(ROUTES.REGISTER);
    }

    const isOver18 = watch("isOver18");

    useEffect(() => {
        if (isOver18 && !watch("isOverDigitalConsent")) {
            setValue("isOverDigitalConsent", true);
        }
    }, [isOver18, setValue, watch]);

    return (
        <div className={cn("flex flex-col", className)} {...props}>
            <CardHeader>
                <CardTitle className="text-2xl">Throwaway Account</CardTitle>
                <CardDescription>Chat without signing up.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-6 ">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="Enter your username"
                                disabled={isSubmitting}
                                {...register("username", {required: "Username is required"})}
                            />
                            {errors.username && (
                                <p className="text-sm text-red-500">{errors.username.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-3">
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
                                            onCheckedChange={(checked) => field.onChange(!!checked)}
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
                                        required: "You mustbe 18 or older to register",
                                    }}
                                    render={({field}) => (
                                        <Checkbox
                                            id="isOver18"
                                            checked={field.value}
                                            onCheckedChange={(checked) => field.onChange(!!checked)}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                />
                                <Label htmlFor="isOver18" className="text-sm">
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
                                            onCheckedChange={(checked) => field.onChange(!!checked)}
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
                                            open(<div className="max-w-4xl"><TermsOfService/></div>);
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

                        {registerUnclaimedError && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4"/>
                                <AlertDescription>
                                    {registerUnclaimedError.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-center">
                            <Turnstile
                                ref={turnstileRef}
                                siteKey="0x4AAAAAACXsJ_rq89s_WjsD"
                                onSuccess={setCaptchaToken}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Starting..." : "Start chatting"}
                        </Button>
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
                </form>
            </CardContent>
        </div>
    );
}
