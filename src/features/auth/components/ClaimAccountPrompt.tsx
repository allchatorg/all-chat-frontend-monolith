'use client';
import {useDialog} from "@/components/providers/DialogProvider";
import {SettingsComponent} from "@/features/auth/components/SettingsComponent";
import {Button} from "@/components/ui/button";

interface ClaimAccountPromptProps {
    // Flow-specific sentence explaining why claiming is required here.
    description: string;
}

// Dialog content shown when an unclaimed (throwaway) user hits a claimed-only
// action. The button swaps the dialog for the account-settings claim form.
export function ClaimAccountPrompt({description}: ClaimAccountPromptProps) {
    const {open} = useDialog();

    const openAccountSettings = () =>
        open(
            <div
                className="w-[80vw] md:min-w-[800px] md:max-w-[800px] h-[500px] overflow-hidden">
                <SettingsComponent defaultTab="account"/>
            </div>
        );

    return (
        <div className="w-[90vw] max-w-md space-y-4 p-2">
            <h2 className="text-lg font-semibold text-foreground">Claim your account to continue</h2>
            <p className="text-sm text-muted-foreground">
                {description}
            </p>
            <Button className="w-full" onClick={openAccountSettings}>
                Claim account
            </Button>
        </div>
    );
}
