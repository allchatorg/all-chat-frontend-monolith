"use client";

import React, {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertTriangle, ShieldCheck} from "lucide-react";
import {sendPhoneVerificationThunk, verifyPhoneThunk} from "@/redux/user/usersThunk";
import {AddPhoneNumberRequest} from "@/models/AddPhoneNumberRequest";
import {PhoneInput} from "@/components/ui/phone-input";
import {useThunk} from "@/lib/hooks/useThunk";
import {useUser} from "@/lib/hooks/useUser";

const VerifyPhone: React.FC = () => {
    const {user} = useUser();

    const [send, sendIsLoading, sendError] = useThunk(sendPhoneVerificationThunk);
    const [verify, verifyIsLoading, verifyError] = useThunk(verifyPhoneThunk);

    const [step, setStep] = useState<"init" | "code">("init");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [code, setCode] = useState("");

    useEffect(() => {
        if (user?.phoneNumber) {
            setPhoneNumber(user.phoneNumber);
        }
    }, [user]);

    const onSend = async () => {
        if (!phoneNumber.trim()) return;
        const payload: AddPhoneNumberRequest = {phoneNumber: phoneNumber.trim()};
        await send(payload).then(
            () => {
                setStep("code");
            }
        )
    };

    const onVerify = async () => {
        if (!code.trim()) return;
        await verify(code.trim());
    };

    const onResend = () => onSend();

    const anyLoading = sendIsLoading || verifyIsLoading;
    const errorToShow = verifyError || sendError;

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary"/>
                    Verify your phone
                </CardTitle>
                <CardDescription>
                    Add a phone number and verify it to secure your account.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {errorToShow && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertDescription className="m-0 p-0">
                            {errorToShow.message || "Something went wrong. Please try again."}
                        </AlertDescription>
                    </Alert>
                )}

                {step === "init" && (
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone number</Label>
                        <div className="space-y-2">
                            <PhoneInput
                                defaultCountry="us"
                                value={phoneNumber}
                                onChange={setPhoneNumber}
                                className="w-full"
                            />
                            <Button onClick={onSend} disabled={anyLoading || !phoneNumber.trim()} className="w-full">
                                Send code
                            </Button>
                        </div>
                    </div>
                )}

                {(step === "code" && !errorToShow) && (
                    <div className="space-y-2">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                            <p className="text-sm text-blue-800">
                                A verification code has been sent to {phoneNumber}
                            </p>
                        </div>
                        <div>
                            <Label htmlFor="code">Verification code</Label>
                            <div className="mt-1 flex gap-2">
                                <Input
                                    id="code"
                                    placeholder="123456"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    maxLength={6}
                                />
                                <Button onClick={onVerify} disabled={anyLoading || !code.trim()}>
                                    Verify
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onResend}
                                disabled={anyLoading}
                                className="px-0 text-sm text-muted-foreground hover:text-primary"
                            >
                                Resend code
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default VerifyPhone;
