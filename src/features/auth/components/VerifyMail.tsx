"use client";

import React, {useState} from "react";
import {useSelector} from "react-redux";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertTriangle, Mail, ShieldCheck} from "lucide-react";
import {selectUser} from "@/redux/user/userSelectors";
import {sendEmailVerificationThunk, verifyEmailThunk} from "@/redux/user/usersThunk";
import {useThunk} from "@/lib/hooks/useThunk";

const VerifyMail: React.FC = () => {
    const user = useSelector(selectUser);

    const [runSendEmail, sendLoading, sendError] = useThunk(sendEmailVerificationThunk);
    const [runVerifyEmail, verifyLoading, verifyError] = useThunk(verifyEmailThunk);

    const [step, setStep] = useState<"init" | "code">("init");
    const [code, setCode] = useState("");
    const [sent, setSent] = useState(false);

    const onSend = async () => {
        await runSendEmail().then(
            () => {
                setSent(true);
                setStep("code")
            }
        )
    };

    const onVerify = async () => {
        if (!code.trim()) return;
        await runVerifyEmail(code.trim());
    };

    const onResend = () => onSend();

    const anyLoading = sendLoading || verifyLoading;

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary"/>
                    Verify your email
                </CardTitle>
                <CardDescription>
                    Secure your account by verifying your email address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="mt-1 flex items-center gap-2">
                        <Input id="email" value={user?.email ?? ""} disabled className="flex-1"/>
                        {!sent && (
                            <Button onClick={onSend} disabled={anyLoading} className="whitespace-nowrap">
                                <Mail className="mr-2 h-4 w-4"/> Send code
                            </Button>
                        )}
                    </div>
                </div>

                {(sendError || verifyError) && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertDescription className="m-0 p-0">
                            {(sendError?.message || verifyError?.message) ?? "Something went wrong. Please try again."}
                        </AlertDescription>
                    </Alert>
                )}

                {step === "code" && (
                    <div className="space-y-2">
                        <div>
                            <Label htmlFor="code">Verification code</Label>
                            <div className="mt-1 flex flex-col gap-2">
                                <Input
                                    id="code"
                                    placeholder="Enter code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                                <div className="flex w-full justify-end">
                                    <Button
                                        onClick={onVerify}
                                        disabled={anyLoading || !code.trim()}
                                        className="whitespace-nowrap"
                                    >
                                        Verify
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={onResend} disabled={anyLoading} className="px-0">
                                Resend code
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default VerifyMail;
