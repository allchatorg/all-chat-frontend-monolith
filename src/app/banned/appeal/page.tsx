'use client';

import React, {Suspense, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import {ArrowLeft, CheckCircle2, Clock, FileText, Mail, XCircle} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Badge} from "@/components/ui/badge";
import {getSessionToken} from "@/lib/tokenManager";
import {useThunk} from "@/lib/hooks/useThunk";
import {getMyBanThunk, submitAppealThunk} from "@/redux/appeals/appealsThunk";
import {selectMyAppeal, selectMyBanContext} from "@/redux/appeals/appealsSelector";
import {BanAppealRequest, BanAppealUserStatus, BanAppealUserView} from "@/models/BanAppeal";
import {ApiError} from "@/models/ApiError";
import {ROUTES} from "@/routes";
import {Spinner} from "@/components/Spinner";

const APPEAL_TEXT_MIN = 50;
const APPEAL_TEXT_MAX = 2000;
const WHAT_WILL_CHANGE_MAX = 1000;

function AppealStatusBadge({status}: { status: BanAppealUserStatus }) {
    switch (status) {
        case BanAppealUserStatus.APPROVED:
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/30">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5"/>
                    Approved
                </Badge>
            );
        case BanAppealUserStatus.DENIED:
            return (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/30">
                    <XCircle className="mr-1 h-3.5 w-3.5"/>
                    Denied
                </Badge>
            );
        case BanAppealUserStatus.EXPIRED:
            return (
                <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">
                    <Clock className="mr-1 h-3.5 w-3.5"/>
                    Expired
                </Badge>
            );
        default:
            return (
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-200 dark:hover:bg-orange-900/30">
                    <Clock className="mr-1 h-3.5 w-3.5"/>
                    In review
                </Badge>
            );
    }
}

function AppealStatusView({appeal, onBack}: { appeal: BanAppealUserView; onBack: () => void }) {
    const isResolved = appeal.status === BanAppealUserStatus.APPROVED
        || appeal.status === BanAppealUserStatus.DENIED;

    return (
        <div className="space-y-4 sm:space-y-6 text-left">
            <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-zinc-100">Your appeal</h2>
                <AppealStatusBadge status={appeal.status}/>
            </div>

            <div className="rounded-lg bg-gray-50 dark:bg-zinc-900 p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div>
                    <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                        Submitted
                    </span>
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-zinc-100">
                        {new Date(appeal.submittedAt).toLocaleString()}
                    </p>
                </div>

                <div>
                    <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                        Your message
                    </span>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-zinc-100 whitespace-pre-wrap wrap-break-word">
                        {appeal.appealText}
                    </p>
                </div>

                {appeal.whatWillChange && (
                    <div>
                        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-zinc-400">
                            What will change
                        </span>
                        <p className="text-sm sm:text-base text-gray-900 dark:text-zinc-100 whitespace-pre-wrap wrap-break-word">
                            {appeal.whatWillChange}
                        </p>
                    </div>
                )}
            </div>

            {appeal.status === BanAppealUserStatus.IN_REVIEW && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40 p-3 sm:p-4">
                    <div className="flex items-start gap-2">
                        <Mail className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 shrink-0"/>
                        <p className="text-sm sm:text-base text-blue-900 dark:text-blue-200">
                            Your appeal is being reviewed. You will be notified by email when a decision is
                            made — or check back on this page.
                        </p>
                    </div>
                </div>
            )}

            {isResolved && appeal.userFacingMessage && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40 p-3 sm:p-4">
                    <span className="mb-1 block text-xs sm:text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                        Message from our team
                    </span>
                    <p className="text-sm sm:text-base text-blue-900 dark:text-blue-200 whitespace-pre-wrap wrap-break-word">
                        {appeal.userFacingMessage}
                    </p>
                </div>
            )}

            {appeal.status === BanAppealUserStatus.APPROVED && (
                <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/40 p-3 sm:p-4">
                    <p className="text-sm sm:text-base text-green-900 dark:text-green-200">
                        Your ban has been lifted. You can log in and use the app again.
                    </p>
                </div>
            )}

            {appeal.status === BanAppealUserStatus.DENIED && (
                <div className="rounded-lg bg-gray-50 dark:bg-zinc-900 p-3 sm:p-4">
                    <p className="text-sm sm:text-base text-gray-700 dark:text-zinc-300">
                        After review, the ban was upheld. This decision is final for this ban.
                    </p>
                </div>
            )}

            {appeal.status === BanAppealUserStatus.EXPIRED && (
                <div className="rounded-lg bg-gray-50 dark:bg-zinc-900 p-3 sm:p-4">
                    <p className="text-sm sm:text-base text-gray-700 dark:text-zinc-300">
                        The ban this appeal was filed against is no longer active, so the appeal was closed.
                    </p>
                </div>
            )}

            <Button className="w-full" variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to ban details
            </Button>
        </div>
    );
}

function AppealForm({onBack}: { onBack: () => void }) {
    const [runSubmitAppeal, isSubmitting] = useThunk(submitAppealThunk);

    const form = useForm<BanAppealRequest>({
        defaultValues: {
            appealText: "",
            whatWillChange: "",
        }
    });

    const appealTextLength = form.watch("appealText")?.length ?? 0;

    const onSubmit = async (values: BanAppealRequest) => {
        try {
            await runSubmitAppeal({
                appealText: values.appealText.trim(),
                whatWillChange: values.whatWillChange?.trim() || undefined,
            });
            toast.success("Your appeal has been submitted.");
        } catch (error: any) {
            toast.error(error?.message || "Failed to submit the appeal. Please try again.");
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 text-left">
            <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-zinc-100">Appeal this ban</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
                    You can submit one appeal for this ban. The decision made on it is final, and you
                    will be notified by email.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="appealText"
                        rules={{
                            required: "Please explain why this ban should be reconsidered",
                            minLength: {
                                value: APPEAL_TEXT_MIN,
                                message: `Please write at least ${APPEAL_TEXT_MIN} characters`
                            },
                            maxLength: {
                                value: APPEAL_TEXT_MAX,
                                message: `Please keep it under ${APPEAL_TEXT_MAX} characters`
                            },
                        }}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Why should this ban be reconsidered?</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        rows={6}
                                        maxLength={APPEAL_TEXT_MAX}
                                        placeholder="Explain what happened and why you believe the ban should be lifted..."
                                    />
                                </FormControl>
                                <FormDescription>
                                    {appealTextLength}/{APPEAL_TEXT_MAX} characters (minimum {APPEAL_TEXT_MIN})
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="whatWillChange"
                        rules={{
                            maxLength: {
                                value: WHAT_WILL_CHANGE_MAX,
                                message: `Please keep it under ${WHAT_WILL_CHANGE_MAX} characters`
                            },
                        }}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>What will you do differently? (optional)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        rows={3}
                                        maxLength={WHAT_WILL_CHANGE_MAX}
                                        placeholder="If the ban is lifted, how will you avoid this happening again?"
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className="space-y-2">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            <FileText className="mr-2 h-4 w-4"/>
                            {isSubmitting ? "Submitting..." : "Submit appeal"}
                        </Button>
                        <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
                            <ArrowLeft className="mr-2 h-4 w-4"/>
                            Back to ban details
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

function BannedAppealPageContent() {
    const router = useRouter();
    const banContext = useSelector(selectMyBanContext);
    const myAppeal = useSelector(selectMyAppeal);
    const [runGetMyBan] = useThunk(getMyBanThunk);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!getSessionToken()) {
            router.push(ROUTES.AUTH);
            return;
        }

        runGetMyBan()
            .catch((e: ApiError) => {
                if (e?.status === 404) {
                    // No active ban -> nothing to appeal.
                    router.push(ROUTES.AUTH);
                } else if (!banContext) {
                    // Transient failure (e.g. 429) with nothing to render — show the
                    // ban page instead of an endless spinner; it has its own fallbacks
                    // and only leaves for /auth on a genuine 404.
                    router.push(ROUTES.BANNED);
                }
            })
            .finally(() => setIsLoading(false));
    }, []);

    const goBack = () => router.push(ROUTES.BANNED);

    return (
        <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 md:p-6">
            <div className="w-full max-w-lg">
                <div
                    className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-red-100 dark:border-red-900/50 /80 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xs">
                    <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-red-500 to-orange-500"></div>

                    {isLoading || !banContext ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner/>
                        </div>
                    ) : myAppeal ? (
                        <AppealStatusView appeal={myAppeal} onBack={goBack}/>
                    ) : banContext.appealable ? (
                        <AppealForm onBack={goBack}/>
                    ) : (
                        <div className="space-y-4 text-center">
                            <p className="text-sm sm:text-base text-gray-700 dark:text-zinc-300">
                                This ban is not eligible for appeal.
                            </p>
                            <Button className="w-full" variant="outline" onClick={goBack}>
                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                Back to ban details
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function BannedAppealPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Spinner/>
            </div>
        }>
            <BannedAppealPageContent/>
        </Suspense>
    );
}
