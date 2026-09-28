import type {FontSnapshot} from "@/lib/fontPresets";
import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from "@/redux/store";
import {blockUserThunk, unblockUserThunk} from "@/redux/user/usersThunk";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {useThunk} from "@/lib/hooks/useThunk";
import {ShieldBan, ShieldCheck} from "lucide-react";
import {isStaff, Role} from "@/models/Role";
import {UserName} from "@/components/UserName";
import {useProDialog} from "@/features/pro/useProDialog";


interface UserActionPopupProps extends Partial<FontSnapshot> {
    userId: number;
    username: string;
    role: Role;
    proBadgeVisible?: boolean;
    proBadgeRevision?: number;
    disabled?: boolean;
}

export const UserActionPopup: React.FC<UserActionPopupProps> = ({
                                                                    userId,
                                                                    username,
                                                                    role,
                                                                    proBadgeVisible,
                                                                    proBadgeRevision,
                                                                    usernameFont,
                                                                    messageFont,
                                                                    fontRevision,
                                                                    disabled = false,
                                                                }) => {
    const {user} = useSelector((state: RootState) => state.user);
    const [blockUser] = useThunk(blockUserThunk);
    const [unblockUser] = useThunk(unblockUserThunk);
    const [isOpen, setIsOpen] = useState(false);
    const openPro = useProDialog();
    const handleOpenPro = () => {
        setIsOpen(false);
        openPro();
    };

    const isBlocked = user?.blockedUsers?.some(u => u.id === userId);
    const isTargetStaff = isStaff(role);

    const getRoleStyles = (role: Role) => {
        switch (role) {
            case Role.SUPER_ADMIN:
                return "text-red-700 font-bold";
            case Role.ADMIN:
                return "text-blue-700 font-bold";
            case Role.MODERATOR:
                return "text-sky-400 font-bold";
            default:
                return "text-gray-500";
        }
    };

    const roleStyles = getRoleStyles(role);
    const showShield = isStaff(role);

    const formatRoleName = (role: string) => {
        return role.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const content = (
        <span className={`flex min-w-0 items-center gap-1 ${roleStyles}`}>
            <UserName
                userId={userId}
                username={username}
                proBadgeVisible={proBadgeVisible}
                proBadgeRevision={proBadgeRevision}
                usernameFont={usernameFont}
                messageFont={messageFont}
                fontRevision={fontRevision}
                onProClick={handleOpenPro}
                renderUsername={!isTargetStaff && !disabled ? name => (
                    <PopoverTrigger asChild>
                        <button type="button" onClick={event => event.stopPropagation()} className="inline-flex min-w-0 cursor-pointer text-left hover:underline decoration-dotted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            {name}
                        </button>
                    </PopoverTrigger>
                ) : undefined}
            />
            {showShield && (
                <span title={formatRoleName(role)} className="cursor-help flex items-center">
                    <ShieldCheck className="h-4 w-4 outline-hidden" style={{shapeRendering: 'crispEdges'}}/>
                </span>
            )}
        </span>
    );

    if (isTargetStaff) {
        return content;
    }

    if (disabled) {
        return content;
    }

    const handleBlock = () => {
        blockUser({id: userId, username, proBadgeVisible, proBadgeRevision, usernameFont, messageFont, fontRevision});
        setIsOpen(false); // Close popup after blocking
    };

    const handleUnblock = () => {
        unblockUser(userId);
        setIsOpen(false); // Close popup after unblocking
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            {content}
            <PopoverContent
                className="w-56 p-4 shadow-lg border-2"
                onClick={(e) => e.stopPropagation()}
                align="start"
                sideOffset={10}
            >
                <div className="flex flex-col gap-3">
                    <div className="font-semibold text-base pb-2 text-center truncate border-b-2 border-border">
                        <UserName userId={userId} username={username} proBadgeVisible={proBadgeVisible} proBadgeRevision={proBadgeRevision} usernameFont={usernameFont} messageFont={messageFont} fontRevision={fontRevision} onProClick={handleOpenPro}/>
                    </div>
                    {isBlocked ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUnblock}
                            className="w-full gap-2 hover:bg-green-50 hover:border-green-500 hover:text-green-700 dark:hover:bg-green-950 dark:hover:border-green-500 dark:hover:text-green-400 transition-all duration-200"
                        >
                            <ShieldCheck className="h-4 w-4"/>
                            Unblock User
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBlock}
                            className="w-full gap-2 hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-200 shadow-xs"
                        >
                            <ShieldBan className="h-4 w-4"/>
                            Block User
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );

};
