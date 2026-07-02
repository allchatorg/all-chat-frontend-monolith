"use client";

import React from "react";
import {IconCircleCheck, IconUserCheck} from "@tabler/icons-react";
import {SiteHeader} from "@ads/components/site-header";
import {useDialog} from "@/components/providers/DialogProvider";
import {SettingsComponent} from "@/features/auth/components/SettingsComponent";
import {Button} from "@/components/ui/button";

const CLAIM_BENEFITS = [
    "Save and manage payment methods",
    "Purchase ad campaigns and track their performance",
    "Sign back in from any device",
    "Recover your account by email if you get logged out",
];

/**
 * Full-page notice shown (inside the portal sidebar chrome) to throwaway
 * accounts on portal pages that require a claimed account — e.g. Payment
 * Methods. Replaces the old silent redirect to /portal/campaign, which looked
 * like broken navigation. Reuses the account-settings claim form, same flow as
 * the campaign page's claim dialog.
 */
export function ClaimAccountGate() {
    const {open: openChatDialog} = useDialog();

    const openAccountSettings = () =>
        openChatDialog(
            <div className="w-[80vw] md:min-w-[800px] md:max-w-[800px] h-[500px] overflow-hidden">
                <SettingsComponent defaultTab="account"/>
            </div>
        );

    return (
        <div className="flex h-full w-full flex-col">
            <SiteHeader
                title="Claim your account"
                description="This page requires a claimed account"
            />
            <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-sm">
                    <div className="space-y-2 text-center">
                        <IconUserCheck className="mx-auto h-10 w-10 text-muted-foreground"/>
                        <h2 className="text-lg font-semibold text-foreground">Claim your account to continue</h2>
                        <p className="text-sm text-muted-foreground">
                            You&apos;re using a throwaway account. Add an email and password to
                            claim it — you keep your username and everything on the account.
                        </p>
                    </div>
                    <ul className="space-y-2">
                        {CLAIM_BENEFITS.map((benefit) => (
                            <li key={benefit} className="flex items-start gap-2 text-sm text-foreground">
                                <IconCircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-500"/>
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                    <Button className="w-full" onClick={openAccountSettings}>
                        Claim account
                    </Button>
                </div>
            </div>
        </div>
    );
}
