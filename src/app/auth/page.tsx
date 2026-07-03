"use client";

import React, {useEffect, useState} from "react";
import {LoginForm} from "@/features/auth/components/LoginForm";
import {AuthView} from "@/models/AuthView";
import {RegisterForm} from "@/features/auth/components/RegisterForm";
import {AnimatePresence, motion} from "framer-motion";
import {RegisterAnonymousForm} from "@/features/auth/components/RegisterAnonymousForm";
import {ForgotPasswordForm} from "@/features/auth/components/ForgotPasswordForm";
import {pingServer} from "@/api/auth/authAPI";
import {useRouter, useSearchParams} from "next/navigation";
import Image from "next/image";
import {Card} from "@/components/ui/card";
import {useIpDetails} from "@/lib/hooks/useIpDetails";
import {useThemedLogo} from "@/lib/hooks/useThemedLogo";

const AuthPage: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter()
    const {ipDetails} = useIpDetails()
    const logoSrc = useThemedLogo();
    const flaggedIp = ipDetails?.requiredVerification !== 'NONE';
    const defaultView = flaggedIp ? AuthView.REGISTER : AuthView.LOGIN;

    const [view, setView] = useState<AuthView>(defaultView);

    useEffect(() => {
        const viewParam = searchParams.get("view");

        if (viewParam === "login") {
            setView(AuthView.LOGIN);
        } else if (viewParam === "register") {
            setView(AuthView.REGISTER);
        } else if (viewParam === "register-anonymous") {
            setView(AuthView.REGISTER_ANONYMOUS);
        } else if (viewParam === "forgot-password") {
            setView(AuthView.FORGOT_PASSWORD);
        }
    }, [searchParams]);

    useEffect(() => {
        pingServer().then();
    }, []);

    const handleAuthViewChange = (newView: AuthView) => {
        const viewMap = {
            [AuthView.LOGIN]: "login",
            [AuthView.REGISTER]: "register",
            [AuthView.REGISTER_ANONYMOUS]: "register-anonymous",
            [AuthView.FORGOT_PASSWORD]: "forgot-password",
        };

        // Keep the post-auth redirect target when hopping between views
        // (e.g. register -> login), so the visitor still lands where they
        // originally intended after authenticating.
        const redirect = searchParams.get("redirect");
        const redirectSuffix = redirect ? `&redirect=${encodeURIComponent(redirect)}` : "";
        router.push(`?view=${viewMap[newView]}${redirectSuffix}`);
    };

    return (
        <div className="flex min-h-full items-center justify-center py-10">
            <div className="flex flex-col items-center gap-8 w-full max-w-[450px] px-4">
                <Card className="pt-6 w-full overflow-hidden">
                    <motion.div
                        initial={{opacity: 0, y: -20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5}}
                        className="flex flex-col items-center gap-2"
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
                    <AnimatePresence mode="wait">
                        {view === AuthView.LOGIN && (
                            <motion.div
                                key="login"
                                className="w-full"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                transition={{duration: 0.3}}
                            >
                                <LoginForm className="" onAuthViewChange={handleAuthViewChange} flaggedIp={flaggedIp}/>
                            </motion.div>
                        )}
                        {view === AuthView.REGISTER && (
                            <motion.div
                                key="register"
                                className="w-full"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                transition={{duration: 0.3}}
                            >
                                <RegisterForm className="" onAuthViewChange={handleAuthViewChange}/>
                            </motion.div>
                        )}
                        {view === AuthView.REGISTER_ANONYMOUS && (
                            <motion.div
                                key="register-anonymous"
                                className="w-full"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                transition={{duration: 0.3}}
                            >
                                <RegisterAnonymousForm className="" onAuthViewChange={handleAuthViewChange}
                                                       flaggedIp={flaggedIp}/>
                            </motion.div>
                        )}
                        {view === AuthView.FORGOT_PASSWORD && (
                            <motion.div
                                key="forgot-password"
                                className="w-full"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                transition={{duration: 0.3}}
                            >
                                <ForgotPasswordForm className="" onAuthViewChange={handleAuthViewChange}/>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </div>
        </div>
    );
};

export default AuthPage;
