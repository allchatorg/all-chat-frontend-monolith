"use client";

import * as React from "react";
import {useForm} from "react-hook-form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertCircle, Loader2} from "lucide-react";
import {CreateChatRoomRequest} from "@/models/CreateChatRoomRequest";
import {ApiError} from "@/models/ApiError";
import {useChatRooms} from "@/lib/hooks/useChatRooms";
import {useUser} from "@/lib/hooks/useUser";
import {useDialog} from "@/components/providers/DialogProvider";

interface FormValues {
    name: string;
}

export const CreateChatRoomForm: React.FC = () => {
    const {user} = useUser();
    const {close} = useDialog();
    const {handleCreateRoom} = useChatRooms(user);

    const [apiError, setApiError] = React.useState<Error | ApiError | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const {register, handleSubmit, watch, formState: {errors}} = useForm<FormValues>({mode: "onChange"});
    const nameValue = watch("name");

    const validateName = (value: string) => {
        if (!value.trim()) return "Name cannot be empty.";
        if (/[^a-zA-Z0-9 ]/.test(value)) return "Only letters, numbers, and spaces are allowed.";
        if (/\s{2,}/.test(value)) return "No double spaces allowed.";
        return true;
    };

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        setApiError(null);
        try {
            const request: CreateChatRoomRequest = {name: data.name.trim()};
            await handleCreateRoom(request);
            close();
        } catch (err: any) {
            setApiError(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-2 w-[300px]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="chatroom-name">Chat Room Name</Label>
                    <Input
                        id="chatroom-name"
                        placeholder="Enter a name..."
                        {...register("name", {validate: validateName})}
                        disabled={isLoading}
                    />
                    {errors.name && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4"/>
                            <AlertDescription>{errors.name.message}</AlertDescription>
                        </Alert>
                    )}
                </div>

                {apiError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4"/>
                        <AlertDescription>
                            {apiError.message || "Failed to create chat room. Please try again."}
                        </AlertDescription>
                    </Alert>
                )}

                <Button
                    type="submit"
                    disabled={isLoading || !!errors.name || !nameValue?.trim()}
                    className="w-full"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                            Creating...
                        </>
                    ) : (
                        "Create Chat Room"
                    )}
                </Button>
            </form>
        </div>
    );
};
