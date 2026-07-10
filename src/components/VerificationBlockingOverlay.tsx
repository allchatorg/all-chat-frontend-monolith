'use client';

import React from 'react';
import {motion} from 'framer-motion';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {Dialog, DialogContent} from '@/components/ui/dialog';
import VerifyMail from '@/features/auth/components/VerifyMail';
import VerifyPhone from '@/features/auth/components/VerifyPhone';
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

    let show: 'NONE' | 'CLAIM' | 'EMAIL' | 'PHONE' = 'NONE';

    if (!user) {
        return <>{children}</>;
    }

    const handleClaimUser = async (email: string, password: string) => {
        try {
            const response = await runClaimAccount({email, password});
        } catch (error) {
            toast.error("Claim failed");
        }
    };

    const determineShow = () => {
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

        return 'NONE';
    };

    show = determineShow();

    const showOverlay = show !== 'NONE';

    return (
        <>
            {children}
            <Dialog open={showOverlay} modal>
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
                    {show === 'CLAIM' && <ClaimUser claimed={user.claimed ?? false} onClaim={handleClaimUser}/>}
                    {show === 'EMAIL' && <VerifyMail/>}
                    {show === 'PHONE' && <VerifyPhone/>}
                </DialogContent>
            </Dialog>
        </>
    );
};