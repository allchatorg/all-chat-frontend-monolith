"use client";

import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {AlertTriangle, Send} from "lucide-react";
import {Label} from "@/components/ui/label";

interface WarnUserForm {
    description: string;
}

interface WarnUserComponentProps {
    onSubmit: (description: string) => void;
}

const WarnUserComponent: React.FC<WarnUserComponentProps> = ({onSubmit}) => {
    const [showMessage, setShowMessage] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<WarnUserForm>({
        mode: "onChange",
        defaultValues: {
            description: "",
        },
    });

    const onFormSubmit = (data: WarnUserForm) => {
        onSubmit(data.description);
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="w-[80vw] space-y-5 text-card-foreground md:w-[500px]">
            <div className="flex items-center border-b pb-2 space-x-3">
                <div className="rounded-full bg-orange-500/10 p-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600"/>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Issue Warning</h3>
                    <p className="text-sm text-muted-foreground">Describe the warning or concern</p>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="add-message"
                    checked={showMessage}
                    onCheckedChange={(checked) => setShowMessage(!!checked)}
                />
                <Label
                    htmlFor="add-message"
                    className="text-sm font-medium text-foreground cursor-pointer"
                >
                    Add additional message
                </Label>
            </div>

            {showMessage && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                        Warning Description
                    </Label>
                    <Textarea
                        placeholder="Enter a detailed warning message..."
                        {...register("description")}
                        className="glass-input min-h-[150px] resize-none border-orange-200 focus:border-orange-400 focus:ring-orange-400 "
                    />
                    {errors.description && (
                        <div className="flex items-center text-sm text-destructive space-x-2">
                            <AlertTriangle className="h-4 w-4"/>
                            <span>{errors.description.message}</span>
                        </div>
                    )}
                </div>
            )}

            <Button
                type="submit"
                className="w-full bg-orange-500 font-medium text-white hover:bg-orange-600"
            >
                <Send className="mr-2 h-4 w-4"/>
                Submit Warning
            </Button>
        </form>
    );
};

export default WarnUserComponent;
