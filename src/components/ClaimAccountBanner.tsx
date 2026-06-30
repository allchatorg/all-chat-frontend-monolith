'use client';
import {Button} from '@/components/ui/button';
import {useUser} from '@/lib/hooks/useUser';
import {Role} from '@/models/Role';
import {useDialog} from '@/components/providers/DialogProvider';
import {SettingsComponent} from '@/features/auth/components/SettingsComponent';
import {useState} from 'react';

export default function ClaimAccountBanner() {
    const {user} = useUser();
    const {open} = useDialog();
    const [isVisible, setIsVisible] = useState(true);

    if (!user || user.role !== Role.UNCLAIMED_USER || !isVisible) {
        return null;
    }

    return (
        <div
            className="glass-surface-strong w-full rounded-none border-x-0 border-t-0 px-3 py-2 flex justify-center items-center transition-colors">
            <span className="text-foreground text-[11px] sm:text-xs inline-flex items-center gap-2">
                You are using a throwaway account, all changes will be lost after logging out.
                <Button
                    variant="outline"
                    className="glass-control h-5 px-2 text-[10px] sm:text-[11px] leading-none transition-colors"
                    onClick={() =>
                        open(
                            <div
                                className="w-[80vw] md:min-w-[800px] md:max-w-[800px] h-[500px] bg-background rounded-lg overflow-hidden border dark:border-zinc-800">
                                <SettingsComponent defaultTab="account"/>
                            </div>
                        )
                    }
                >
                    Claim
                </Button>
            </span>
            <Button
                variant="ghost"
                size="icon"
                className="glass-control ml-2 h-6 w-6"
                onClick={() => setIsVisible(false)}
            >
                ×
            </Button>
        </div>
    );
}
