"use client";

import React from "react";
import {useRouter} from "next/navigation";
import {Home, ShieldAlert} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";

export default function UnauthorizedPage() {
    const router = useRouter();

    const handleGoHome = () => {
        router.push("/");
    };

    return (
        <div className="h-full dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center pb-4">
                    <div
                        className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                        <ShieldAlert className="w-8 h-8 text-destructive"/>
                    </div>
                    <CardTitle className="text-3xl font-bold">403</CardTitle>
                    <CardDescription className="text-lg">Forbidden</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4"/>
                        <AlertTitle>Access Forbidden</AlertTitle>
                        <AlertDescription>
                            You don't have permission to access this resource. This area is
                            restricted to authorized users only.
                        </AlertDescription>
                    </Alert>

                    <div className="text-sm text-muted-foreground space-y-2">
                        <p className="font-medium">Common reasons for this error:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Insufficient permissions for this resource</li>
                            <li>Your account role doesn't allow access</li>
                            <li>This content is restricted to specific users</li>
                            <li>You need elevated privileges</li>
                        </ul>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                        onClick={handleGoHome}
                        className="mx-auto w-full sm:w-auto"
                        variant="outline"
                    >
                        <Home className="mr-2 h-4 w-4"/>
                        Go Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
