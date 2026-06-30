import React from 'react';
import {Ban, Copy, Eye, Flag, Shield, User, X} from 'lucide-react';
import {ModMainScreen} from "@/features/chatroom/components/ModMainScreen";
import {useDialog} from "@/components/providers/DialogProvider";
import {useDispatch} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {setActiveRightSidebar} from "@/redux/settings/settingsSlice";
import BanRequestForm from "@/features/chatroom/components/BanRequestForm";
import {useModPanelHook} from "@/lib/hooks/useModPanelHook";
import {useThunk} from "@/lib/hooks/useThunk";
import {banUserThunk, revokeBanThunk, warnUserThunk} from "@/redux/modPanel/modPanelThunk";
import {toast} from "sonner";
import WarnUserComponent from "@/features/chatroom/components/WarnUserComponent";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";
import {canActOn, Role} from '@/models/Role';
import {Button} from "@/components/ui/button";
import {useIsMobile} from "@/lib/hooks/useIsMobile";

interface ModViewProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const ModView: React.FC<ModViewProps> = ({
                                             isOpen = true,
                                             onClose = () => {
                                             }
                                         }) => {
    const {open, close} = useDialog();
    const dispatch = useDispatch<AppDispatch>();
    const {selectedUserId: userId, selectedUser: user, chatRoomMessages, loading} = useModPanelHook();
    const roleAccess = useRoleAccess();
    const [revokeBan, revokeBanLoading, revokeBanError] = useThunk(revokeBanThunk);
    const [warnUser, warnUserLoading, warnUserError] = useThunk(warnUserThunk);
    const [banUser, banUserLoading, banUserError] = useThunk(banUserThunk);
    const isMobile = useIsMobile();

    const handleCopyId = () => {
        navigator.clipboard.writeText(userId?.toString() || '');
        toast.success("Copied ID to clipboard");
    };

    const handleViewDetails = () => {
        if (userId) {
            window.location.href = `/users/${userId}/details`;
        } else {
            toast.error("No user selected");
        }
    };

    if (!isOpen) return null;

    const handleWarning = (description: string) => {
        if (userId) {
            warnUser({userId, description}).then(() => {
                toast.success("Warning sent successfully");
            }).catch((error) => {
                toast.error(`Failed to send warning: ${error.message}`);
            });
        } else {
            toast.error("No user selected for warning");
        }
        close();
    };

    return (
        <div className="glass-panel flex h-full w-full flex-col rounded-xl border">
            <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-lg font-semibold text-card-foreground">{user?.username}</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    className="glass-control"
                    onClick={() => dispatch(setActiveRightSidebar(isMobile ? null : 'top-online'))}
                >
                    <X className="h-4 w-4"/>
                </Button>

            </div>
            <div className="border-b p-4">
                <div className="flex gap-2 mb-3">
                    {canActOn(useRoleAccess().currentRole, user ? user.role : Role.UNCLAIMED_USER) &&
                        <div className="flex-1">
                            {user?.banned ? (
                                <button
                                    onClick={() => {
                                        if (userId) {
                                            revokeBan(userId);
                                        }
                                    }}
                                    className="glass-surface flex h-full w-full flex-col items-center justify-center rounded-md p-3 transition-colors"
                                >
                                    <Shield className="mb-1 h-5 w-5 text-green-600"/>
                                    <span className="text-xs font-medium text-muted-foreground">Revoke Ban</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() =>
                                        open(
                                            <div className="w-full">
                                                {userId ? (
                                                    <BanRequestForm onSubmit={banUser} userId={userId.toString()}
                                                                    onClose={close}/>
                                                ) : (
                                                    <div className="text-destructive">No user selected</div>
                                                )}
                                            </div>
                                        )
                                    }
                                    className="glass-surface flex h-full w-full flex-col items-center justify-center rounded-md p-3 transition-colors"
                                >
                                    <Ban className="mb-1 h-5 w-5 text-destructive"/>
                                    <span className="text-xs font-medium text-muted-foreground">Ban</span>
                                </button>
                            )}
                        </div>}
                    <button
                        onClick={handleCopyId}
                        className="glass-surface flex flex-1 flex-col items-center justify-center rounded-md p-3 transition-colors">
                        <Copy className="mb-1 h-5 w-5 text-blue-500"/>
                        <span className="text-xs font-medium text-muted-foreground">Copy ID</span>
                    </button>

                    <button
                        onClick={() => {
                            open(
                                <WarnUserComponent onSubmit={handleWarning}/>
                            )
                        }}
                        className="glass-surface flex flex-1 flex-col items-center justify-center rounded-md p-3 transition-colors">
                        <Flag className="mb-1 h-5 w-5 text-orange-500"/>
                        <span className="text-xs font-medium text-muted-foreground">Warning</span>
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleViewDetails}
                        className="glass-surface flex flex-1 flex-col items-center justify-center rounded-md p-3 transition-colors">
                        <Eye className="mb-1 h-5 w-5 text-purple-500"/>
                        <span className="text-xs font-medium text-muted-foreground">View Details</span>
                    </button>
                </div>
            </div>


            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="p-4 text-muted-foreground">Loading...</div>
                ) : (
                    <ModMainScreen
                        onClick={handleCopyId}
                        userRole={user?.role || 'USER'}
                        messageCount={chatRoomMessages?.totalElements || 0}
                    />
                )}
            </div>

            <div className="glass-surface rounded-b-lg border-t p-4">
                <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground"/>
                    <span className="text-sm text-muted-foreground">Role:</span>
                    <span className="text-sm font-medium text-foreground">{user?.role}</span>
                </div>
            </div>

        </div>
    );
};

export default ModView;
