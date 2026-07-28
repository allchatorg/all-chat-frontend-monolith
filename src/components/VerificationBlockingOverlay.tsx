'use client';

import React, {useEffect} from 'react';
import {motion} from 'framer-motion';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {Dialog, DialogContent} from '@/components/ui/dialog';
import VerifyMail from '@/features/auth/components/VerifyMail';
import VerifyPhone from '@/features/auth/components/VerifyPhone';
import VerifyIdentity from '@/features/auth/components/VerifyIdentity';
import {useIpDetails} from "@/lib/hooks/useIpDetails";
import {useUser} from "@/lib/hooks/useUser";
import {useThemedLogo} from "@/lib/hooks/useThemedLogo";
import {ClaimUser} from "@/features/auth/components/ClaimUser";
import {useThunk} from "@/lib/hooks/useThunk";
import {claimAccountThunk} from "@/redux/auth/authThunk";
import {toast} from "sonner";

interface VerificationBlockingOverlayProps {
    children: React.ReactNode;
}

export const VerificationBlockingOverlay: React.FC<VerificationBlockingOverlayProps> = ({children}) => {
    const [runClaimAccount, claimAccountLoading, claimAccountError] = useThunk(claimAccountThunk);
    const {ipDetails} = useIpDetails();
    const {user} = useUser();
    const logoSrc = useThemedLogo();
    const pathname = usePathname();

    const handleClaimUser = async (email: string, password: string) => {
        try {
            const response = await runClaimAccount({email, password});
        } catch (error) {
            toast.error("Claim failed");
        }
    };

    const determineShow = (): 'NONE' | 'CLAIM' | 'EMAIL' | 'PHONE' | 'ID' => {
        if (!user) return 'NONE';

        const required = ipDetails?.requiredVerification ?? 'NONE';
        const hasEmail = !!user?.email;
        const emailVerified = !!user?.verified;
        const hasPhone = !!user?.phoneNumberVerificationDate;
        const isClaimed = !!user?.claimed;

        if (user.role === 'GUEST') return 'NONE';
        // Never block the ban/appeal pages with the verification dialog.
        if (pathname.startsWith('/banned')) return 'NONE';
        if (!isClaimed && required !== 'NONE') return 'CLAIM';
        if (required === 'EMAIL' && !emailVerified) return 'EMAIL';
        if (required === 'PHONE') {
            if (!hasEmail || !emailVerified) return 'EMAIL';
            if (!hasPhone) return 'PHONE';
        }

        // Staff-mandated ID verification: only blocks once the earlier
        // steps are satisfied (or not required at all).
        const idStatus = user.idVerificationStatus;
        if (idStatus === 'REQUIRED' || idStatus === 'PENDING' || idStatus === 'REJECTED') {
            return 'ID';
        }

        return 'NONE';
    };

    const show = determineShow();
    const showOverlay = show !== 'NONE';

    // Stripe's verifyIdentity modal snapshots the body style while our dialog
    // is open (pointer-events: none) and restores that snapshot when its
    // iframe tears down — which happens asynchronously and can land AFTER the
    // webhook->WS result has already closed this dialog, leaving the whole
    // page unclickable. Clear the stale lock, and retry across the teardown
    // window; skip whenever some other dialog is legitimately open.
    useEffect(() => {
        if (showOverlay) return;
        const clearStaleLock = () => {
            if (document.querySelector('[role="dialog"][data-state="open"]')) return;
            if (document.body.style.pointerEvents === 'none') {
                document.body.style.pointerEvents = '';
            }
        };
        clearStaleLock();
        const timers = [300, 1000, 2500].map(ms => window.setTimeout(clearStaleLock, ms));
        return () => timers.forEach(t => window.clearTimeout(t));
    }, [showOverlay]);

    // Unmount the dialog entirely instead of flipping `open`, so closing never
    // depends on Radix's exit-animation cleanup.
    if (!showOverlay) {
        return <>{children}</>;
    }

    return (
        <>
            {children}
            <Dialog open modal>
                <DialogContent
                    showCloseButton={false}
                    className="w-[90%] md:w-full rounded-xl md:max-w-[450px] shadow-2xl"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <motion.div
                        initial={{opacity: 0, y: -20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5}}
                        className="flex flex-col items-center gap-2 py-6"
                    >
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
                    </motion.div>
                    {show === 'CLAIM' && <ClaimUser claimed={user?.claimed ?? false} onClaim={handleClaimUser}/>}
                    {show === 'EMAIL' && <VerifyMail/>}
                    {show === 'PHONE' && <VerifyPhone/>}
                    {show === 'ID' && <VerifyIdentity/>}
                </DialogContent>
            </Dialog>
        </>
    );
};