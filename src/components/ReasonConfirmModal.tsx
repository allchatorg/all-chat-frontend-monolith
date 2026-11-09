import React, {useState} from 'react';
import {ConfirmModal} from "@/components/ConfirmModal";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";

interface ReasonConfirmModalProps {
    onClose: () => void;
    onConfirm: (reason: string) => void | Promise<void>;
    title: string;
    description: string;
}

export const ReasonConfirmModal: React.FC<ReasonConfirmModalProps> = ({
                                                                          onClose,
                                                                          onConfirm,
                                                                          title,
                                                                          description
                                                                      }) => {
    const [reason, setReason] = useState("");
    const trimmedReason = reason.trim();

    return (
        <ConfirmModal
            title={title}
            description={description}
            onClose={onClose}
            onConfirm={() => onConfirm(trimmedReason)}
            confirmDisabled={trimmedReason.length === 0}
        >
            <div className="space-y-2 pt-2">
                <Label htmlFor="moderation-reason">Reason</Label>
                <Textarea
                    id="moderation-reason"
                    placeholder="Why is this needed? Saved to the Audit Log."
                    maxLength={1000}
                    value={reason}
                    onChange={event => setReason(event.target.value)}
                    className="glass-input min-h-[100px] resize-none"
                />
            </div>
        </ConfirmModal>
    );
};
