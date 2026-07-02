"use client";

import {ArrowLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import {MethodConfig} from "@/features/auth/components/forgot-password/types";

type RecoveryStepShellProps = {
    config: MethodConfig;
    onBackToMethods: () => void;
    children: React.ReactNode;
};

export function RecoveryStepShell({
                                      config,
                                      onBackToMethods,
                                      children,
                                  }: RecoveryStepShellProps) {
    const Icon = config.icon;

    return (
        <div className="space-y-5">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="-ml-2"
                onClick={onBackToMethods}
            >
                <ArrowLeft className="h-4 w-4"/>
                All options
            </Button>

            <div className="rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center gap-3">
                    <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background text-foreground shadow-xs">
                        <Icon className="h-5 w-5"/>
                    </span>
                    <div>
                        <p className="text-sm font-medium">{config.title}</p>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                </div>
            </div>

            {children}
        </div>
    );
}
