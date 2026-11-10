import React from "react";
import {useDialog} from "@/components/providers/DialogProvider";
import {ReasonConfirmModal} from "@/components/ReasonConfirmModal";
import {useThunk} from "@/lib/hooks/useThunk";
import {revokeBanThunk} from "@/redux/modPanel/modPanelThunk";

export function useRevokeBanDialog() {
    const {open, close} = useDialog();
    const [revokeBan] = useThunk(revokeBanThunk);

    return (userId: number, username: string) => open(
        <ReasonConfirmModal
            title="Revoke this ban?"
            description={`${username} will be able to use the app again straight away. Messages deleted with the ban stay deleted.`}
            onClose={close}
            onConfirm={async reason => {
                try {
                    await revokeBan({userId, reason});
                    close();
                } catch {
                    // revokeBanThunk has already shown why; staying open keeps the reason typed so far.
                }
            }}
        />
    );
}
