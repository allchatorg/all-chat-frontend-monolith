import React from 'react';
import {Button} from "@/components/ui/button";

interface ConfirmModalProps {
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
                                                              onClose,
                                                              onConfirm,
                                                              title,
                                                              description
                                                          }) => {
    return (
        <div className="w-[80vw] sm:w-[500px] space-y-4 p-2 rounded-md">
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground accent-destructive">{description}</p>
            </div>
            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                    No
                </Button>
                <Button variant="destructive" onClick={onConfirm}>
                    Yes
                </Button>
            </div>
        </div>
    );
};