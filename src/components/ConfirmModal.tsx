import React, {useState} from 'react';
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";

interface ConfirmModalProps {
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
                                                              onClose,
                                                              onConfirm,
                                                              title,
                                                              description
                                                          }) => {
    const [isConfirming, setIsConfirming] = useState(false);

    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            await onConfirm();
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <div className="w-[80vw] sm:w-[500px] space-y-4 p-2 rounded-md">
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground accent-destructive">{description}</p>
            </div>
            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} disabled={isConfirming}>
                    No
                </Button>
                <Button variant="destructive" onClick={handleConfirm} disabled={isConfirming}>
                    {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Yes
                </Button>
            </div>
        </div>
    );
};
