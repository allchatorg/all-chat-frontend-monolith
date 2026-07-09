'use client';

import React from "react";
import {useForm} from "react-hook-form";
import {CheckCircle2, XCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {BanAppealDecision, BanAppealResolutionRequest} from "@/models/BanAppeal";

const INTERNAL_NOTE_MIN = 10;
const INTERNAL_NOTE_MAX = 2000;
const USER_MESSAGE_MAX = 1000;

interface AppealResolutionFormProps {
    username: string;
    onSubmit: (request: BanAppealResolutionRequest) => Promise<void>;
    onCancel: () => void;
}

export default function AppealResolutionForm({username, onSubmit, onCancel}: AppealResolutionFormProps) {
    const form = useForm<BanAppealResolutionRequest>({
        defaultValues: {
            decision: undefined,
            internalNote: "",
            userFacingMessage: "",
        }
    });

    const decision = form.watch("decision");
    const isSubmitting = form.formState.isSubmitting;

    const handleSubmit = async (values: BanAppealResolutionRequest) => {
        await onSubmit({
            decision: values.decision,
            internalNote: values.internalNote.trim(),
            userFacingMessage: values.userFacingMessage?.trim() || undefined,
        });
    };

    return (
        <div className="w-[80vw] max-w-lg mx-auto p-2 sm:p-4 space-y-4">
            <div>
                <h2 className="text-lg font-semibold">Resolve appeal</h2>
                <p className="text-sm text-muted-foreground">
                    Approving unbans <span className="font-medium">{username}</span> immediately. Denying
                    keeps the ban and is final for this ban. The user is notified by email either way.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="decision"
                        rules={{required: "Please choose a decision"}}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Decision</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                                    >
                                        <Label
                                            htmlFor="decision-approve"
                                            className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 ${decision === BanAppealDecision.APPROVED ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-border"}`}
                                        >
                                            <RadioGroupItem value={BanAppealDecision.APPROVED} id="decision-approve"/>
                                            <CheckCircle2 className="h-4 w-4 text-green-600"/>
                                            <span>Approve — unban</span>
                                        </Label>
                                        <Label
                                            htmlFor="decision-deny"
                                            className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 ${decision === BanAppealDecision.DENIED ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-border"}`}
                                        >
                                            <RadioGroupItem value={BanAppealDecision.DENIED} id="decision-deny"/>
                                            <XCircle className="h-4 w-4 text-red-600"/>
                                            <span>Deny — uphold ban</span>
                                        </Label>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="internalNote"
                        rules={{
                            required: "An internal resolution note is required",
                            minLength: {
                                value: INTERNAL_NOTE_MIN,
                                message: `Please write at least ${INTERNAL_NOTE_MIN} characters`
                            },
                            maxLength: {
                                value: INTERNAL_NOTE_MAX,
                                message: `Please keep it under ${INTERNAL_NOTE_MAX} characters`
                            },
                        }}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Internal resolution note (required)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        rows={3}
                                        maxLength={INTERNAL_NOTE_MAX}
                                        placeholder="Why was this decision made? Visible to staff and the audit log only."
                                    />
                                </FormControl>
                                <FormDescription>Never shown to the user.</FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="userFacingMessage"
                        rules={{
                            maxLength: {
                                value: USER_MESSAGE_MAX,
                                message: `Please keep it under ${USER_MESSAGE_MAX} characters`
                            },
                        }}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Message to the user (optional)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        rows={3}
                                        maxLength={USER_MESSAGE_MAX}
                                        placeholder="Shown on their appeal status page and included in the decision email. Cite the rule, not the evidence."
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            variant={decision === BanAppealDecision.DENIED ? "destructive" : "default"}
                        >
                            {isSubmitting
                                ? "Resolving..."
                                : decision === BanAppealDecision.DENIED
                                    ? "Deny appeal"
                                    : "Approve & unban"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
