"use client";

import {ArrowRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {methodConfigs, methodOrder, RecoveryMethod} from "@/features/auth/components/forgot-password/types";

type ForgotPasswordMethodPickerProps = {
    onMethodSelect: (method: RecoveryMethod) => void;
    onBackToLogin: () => void;
};

export function ForgotPasswordMethodPicker({
                                               onMethodSelect,
                                               onBackToLogin,
                                           }: ForgotPasswordMethodPickerProps) {
    return (
        <div className="space-y-5">
            <div className="grid gap-3">
                {methodOrder.map((method) => {
                    const config = methodConfigs[method];
                    const Icon = config.icon;

                    return (
                        <button
                            key={method}
                            type="button"
                            onClick={() => onMethodSelect(method)}
                            className="group flex w-full items-center gap-3 rounded-lg border bg-background p-4 text-left shadow-sm transition hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <span
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
                                <Icon className="h-5 w-5"/>
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium">{config.title}</span>
                                <span className="mt-1 block text-sm text-muted-foreground">
                                    {config.description}
                                </span>
                            </span>
                            <ArrowRight
                                className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground"/>
                        </button>
                    );
                })}
            </div>

            <Button
                type="button"
                variant="link"
                className="mx-auto flex h-auto px-0 text-sm"
                onClick={onBackToLogin}
            >
                Back to login
            </Button>
        </div>
    );
}
