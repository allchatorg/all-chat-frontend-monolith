import React, {useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {AlertTriangle, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useThunk} from "@/lib/hooks/useThunk";
import {deleteAccountThunk} from "@/redux/user/usersThunk";
import {useDialog} from "@/components/providers/DialogProvider";
import {trackUserDeleted} from "@/lib/analytics";

interface AccountDeleteComponentProps {
    userId: number | undefined;
}

export function AccountDeleteComponent({userId}: AccountDeleteComponentProps) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [deleteMessages, setDeleteMessages] = useState(false);
    const [confirmationInput, setConfirmationInput] = useState("");

    const [deleteAccount, deleteAccountLoading, deleteAccountError] = useThunk(deleteAccountThunk);

    const {open, close} = useDialog();

    const handleDeleteClick = () => {
        setShowConfirmation(true);
    };

    const handleCancel = () => {
        setShowConfirmation(false);
        setDeleteMessages(false);
        setConfirmationInput("");
    };

    const handleFinalDelete = () => {
        if (confirmationInput === "sudo delete account") {
            if (userId) {
                trackUserDeleted({user_id: userId?.toString()})
            }
            deleteAccount({removeMessages: deleteMessages})
                .then(close)
        }
    };

    const isConfirmValid = confirmationInput === "sudo delete account";

    return (
        <Card
            className="mx-auto max-w-2xl border-red-200 bg-red-50/50 shadow-lg dark:border-red-900 dark:bg-red-950/20">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-red-600 dark:text-red-500">
                    <AlertTriangle className="h-6 w-6"/>
                    Danger Zone
                </CardTitle>
                <CardDescription className="text-base text-red-600/80 dark:text-red-400/80">
                    Irreversible and destructive actions.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <CardDescription className="dark:text-gray-400">
                    Once you delete your account, there is no going back. Please be certain.
                </CardDescription>
                {!showConfirmation ? (
                    <div className="flex justify-end">
                        <Button
                            variant="destructive"
                            onClick={handleDeleteClick}
                            className="bg-red-600 px-6 py-2 text-white shadow-sm hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                        >
                            Delete Account
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="delete-messages"
                                checked={deleteMessages}
                                onCheckedChange={(val) => setDeleteMessages(!!val)}
                                className="border-red-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 dark:border-red-800 dark:data-[state=checked]:bg-red-600"
                            />
                            <Label
                                htmlFor="delete-messages"
                                className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Also delete past messages
                            </Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-delete"
                                   className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Type{" "}
                                <code
                                    className="rounded border bg-gray-100 px-2 py-1 font-mono text-xs text-red-600 dark:bg-gray-800 dark:border-gray-700 dark:text-red-400">
                                    sudo delete account
                                </code>{" "}
                                to confirm:
                            </Label>
                            <Input
                                id="confirm-delete"
                                placeholder="sudo delete account"
                                value={confirmationInput}
                                onChange={(e) => setConfirmationInput(e.target.value)}
                                className="border-red-200 font-mono text-base focus:border-red-400 focus:ring-red-400/20 dark:bg-gray-950 dark:border-red-900 dark:focus:border-red-500 dark:text-gray-100 dark:focus:ring-red-500/20 dark:placeholder:text-gray-500"
                            />
                        </div>

                        <div className="flex flex-wrap justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="border-gray-300 px-6 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:bg-transparent"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={!isConfirmValid || deleteAccountLoading}
                                onClick={handleFinalDelete}
                                className="flex items-center gap-2 bg-red-600 px-6 py-2 font-medium text-white shadow-sm hover:bg-red-700 disabled:bg-red-300 dark:bg-red-700 dark:hover:bg-red-800 dark:disabled:bg-red-900/50 dark:disabled:text-gray-400"
                            >
                                {deleteAccountLoading && (
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                )}
                                Confirm
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}