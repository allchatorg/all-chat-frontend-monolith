"use client";
import {Button} from "@/components/ui/button";
import {ArrowDownAZ, Book, Bug, Diamond, LogOut, Megaphone, Menu, MoreVertical, Settings, Shield} from "lucide-react";
import Image from "next/image";
import {usePathname, useRouter} from "next/navigation";
import {useDialog} from "./providers/DialogProvider";
import {useDispatch, useSelector} from "react-redux";
import {selectUser} from "@/redux/user/userSelectors";
import {SettingsComponent} from "@/features/auth/components/SettingsComponent";
import {RoomTabOrderSettings} from "@/features/auth/components/RoomTabOrderSettings";
import {AppDispatch} from "@/redux/store";
import {useState} from "react";
import {useThemedLogo} from "@/lib/hooks/useThemedLogo";
import SearchRooms from "@/features/chatroom/components/SearchRooms";
import SearchUsers from "@/features/privateChat/components/SearchUsers";
import {logoutThunk} from "@/redux/auth/authThunk";
import {isAuthFlowRoute, ROUTES} from "@/routes";
import {Role} from "@/models/Role";
import {ConfirmModal} from "@/components/ConfirmModal";
import ClaimAccountBanner from "@/components/ClaimAccountBanner";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {Sidebar} from "@/components/Sidebar";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import TermsOfService from "@/components/TermsOfService";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import {NotificationBell} from "@/features/notifications/components/NotificationBell";
import {
    joinAndSelectChatRoomThunk,
    searchChatRoomsByNameThunk,
    selectAndLoadChatRoomThunk
} from "@/redux/chatRoom/chatRoomThunk";
import {selectJoinedUserChatRoomsState} from "@/redux/chatRoom/chatRoomSelectors";
import {BUG_REPORTS_CHATROOM_NAME, isBugReportsChatRoomName} from "@/lib/chatRooms";
import {toast} from "sonner";
import {useProDialog} from '@/features/pro/useProDialog';

// Keep the branded button independent of the navbar's generic .text-white recoloring.
const PRO_NAV_BUTTON_CLASS_NAME = 'relative isolate overflow-hidden rounded-full border border-white/15 bg-clip-padding bg-linear-to-r from-[#4039bd] to-[#4267df] font-semibold text-[#fff] shadow-none [text-shadow:none] hover:from-[#3730a3] hover:to-[#3658c7] hover:text-[#fff] focus-visible:ring-blue-300 dark:border-blue-300/35 dark:from-[#454bc4] dark:to-[#315fd3] dark:text-[#fff] dark:hover:from-[#4b53d0] dark:hover:to-[#3868df] dark:hover:text-[#fff]';

export function Navbar() {
    const {open, close} = useDialog();
    const router = useRouter();
    const user = useSelector(selectUser);
    const userChatRooms = useSelector(selectJoinedUserChatRoomsState);
    const dispatch = useDispatch<AppDispatch>();
    const pathname = usePathname();
    const {isStaffMember} = useRoleAccess();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const logoSrc = useThemedLogo();

    const openPro = useProDialog();

    const handleLogout = () => {
        if (user?.role !== Role.GUEST && user?.role !== Role.UNCLAIMED_USER) {
            dispatch(logoutThunk());
            return;
        }
        open(
            <div className="w-full">
                <ConfirmModal onClose={() => close()}
                              onConfirm={() => {
                                  dispatch(logoutThunk());
                                  close();
                              }}
                              title={"Are you sure you want to logout?"}
                              description={"You are using a throwaway account." +
                                  " You will lose access to this account and all its data if you logout without creating a permanent account."}
                />
            </div>
        )
    };

    const goToChatRoom = (roomId: number) => {
        router.push(`${ROUTES.HOME}?chatRoomId=${roomId}`);
    };

    const handleBugReportsClick = async () => {
        try {
            const joinedBugReportsRoom = userChatRooms.find(room =>
                isBugReportsChatRoomName(room.chatRoomName)
            );

            if (joinedBugReportsRoom) {
                dispatch(selectAndLoadChatRoomThunk(joinedBugReportsRoom));
                goToChatRoom(joinedBugReportsRoom.chatRoomId);
                return;
            }

            const rooms = await dispatch(searchChatRoomsByNameThunk(BUG_REPORTS_CHATROOM_NAME)).unwrap();
            const bugReportsRoom = rooms.find(room => isBugReportsChatRoomName(room.roomName));

            if (!bugReportsRoom) {
                toast.error("Bug Reports room is not available yet.");
                return;
            }

            await dispatch(joinAndSelectChatRoomThunk(bugReportsRoom.roomId)).unwrap();
            goToChatRoom(bugReportsRoom.roomId);
        } catch (error: any) {
            toast.error(typeof error === "string" ? error : error?.message || "Failed to join Bug Reports.");
        }
    };

    const handleAdvertiseClick = () => {
        // Ads portal is now part of this app (merged monolith).
        router.push("/portal");
    };

    const handleCreateAccount = () => {
        router.push(ROUTES.REGISTER);
    };

    const isOnHomePage = pathname === ROUTES.HOME;
    const isOnPrivateChatPage = pathname === ROUTES.PRIVATE_CHAT;
    const isGuest = user?.role === Role.GUEST;
    const isStaffOrHigher = user ? user.role === Role.MODERATOR || user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN : false;
    const canUsePrivateChat = Boolean(user && user.claimed && !isGuest);
    const hasAd = (user?.purchasedAdsCount ?? 0) > 0;
    const advertiseLabel = hasAd ? "My Ads" : "Advertise";
    const advertiseTitle = hasAd ? "My ads on allchat" : "Advertise on allchat";

    // Show if they are logged in, not staff, and haven't applied
    const shouldShowModButton = Boolean(
        user &&
        !isGuest &&
        !isStaffOrHigher &&
        !user.appliedForModerator
    );

    const meetsModCriteria = Boolean(
        user &&
        user.role === Role.USER &&
        user.verified &&
        user.email
    );

    const handleApplyModClick = () => {
        if (meetsModCriteria) {
            router.push(ROUTES.APPLY_MODERATOR);
        } else {
            open(
                <div className="w-[80vw] sm:w-[400px] p-2 flex flex-col items-center text-center gap-4">
                    <div
                        className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                        <Shield className="h-6 w-6"/>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Action Required</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        You need to have a claimed and verified account in order to apply to be a moderator.
                    </p>
                    <div className="w-full flex justify-end">
                        <Button onClick={() => close()} className="w-full">Understood</Button>
                    </div>
                </div>
            );
        }
    };

    if (isAuthFlowRoute(pathname)) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <ClaimAccountBanner/>
            <nav
                className="navbar-floating relative w-full h-auto md:h-16 py-2 flex flex-wrap md:flex-nowrap items-center px-4
             bg-transparent border-0 shadow-none gap-y-2 md:gap-y-0 md:justify-between">
                <div className="flex items-center gap-2">
                    {isStaffMember() && (
                        <div>
                            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="glass-control"
                                            aria-label="Open sidebar" title="Open sidebar">
                                        <Menu className="h-6 w-6"/>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-[300px]">
                                    <Sidebar className="h-full w-full border-none"
                                             onClose={() => setIsSidebarOpen(false)}/>
                                </SheetContent>
                            </Sheet>
                        </div>
                    )}
                    <Image
                        src={logoSrc}
                        alt="Logo"
                        width={120}
                        height={36}
                        priority
                        className="h-9 w-auto absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
                        onClick={() => {
                            router.push(ROUTES.HOME)
                        }}
                    />
                    {user && isOnHomePage && (
                        <div
                            className="md:order-0 w-auto md:w-auto md:absolute md:left-1/2 max-w-md md:mx-0 md:-translate-x-1/2">
                            <div className="relative flex items-center gap-2">
                                {shouldShowModButton && (
                                    <>
                                        <Button
                                            className="glass-control hidden lg:inline-flex absolute right-[calc(100%+200px)] whitespace-nowrap gap-2 text-foreground hover:text-foreground"
                                            onClick={handleApplyModClick}
                                        >
                                            <Shield className="h-4 w-4"/>
                                            Become a mod
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            aria-label="Become a mod"
                                            title="Become a mod"
                                            className="glass-control lg:hidden text-foreground hover:text-foreground"
                                            onClick={handleApplyModClick}
                                        >
                                            <Shield className="h-5 w-5"/>
                                        </Button>
                                    </>
                                )}
                                <SearchRooms/>
                            </div>
                        </div>
                    )}
                    {user && isOnPrivateChatPage && canUsePrivateChat && (
                        <div
                            className="md:order-0 w-auto md:w-auto md:absolute md:left-1/2 max-w-md md:mx-0 md:-translate-x-1/2">
                            <SearchUsers/>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 md:gap-4 ml-auto">
                    {user && (
                        <div className="flex items-center gap-2 md:gap-4">
                            <Button onClick={openPro} aria-label="Explore allchat Pro" className={`${PRO_NAV_BUTTON_CLASS_NAME} hidden h-9 gap-2 px-3 md:inline-flex`}><Diamond className="h-4 w-4"/><span className="hidden xl:inline">allchat</span> Pro</Button>
                            <div className="hidden md:flex items-center gap-2">
                                {!isStaffOrHigher && (
                                    <Button
                                        variant="outline"
                                        aria-label={advertiseTitle}
                                        title={advertiseTitle}
                                        className="glass-control h-9 w-9 px-0 xl:w-auto xl:px-3 text-foreground hover:text-foreground"
                                        onClick={handleAdvertiseClick}
                                    >
                                        <Megaphone className="h-4 w-4"/>
                                        <span className="hidden xl:inline">{advertiseLabel}</span>
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    aria-label="Report a bug"
                                    title="Report a bug"
                                    className="glass-control h-9 w-9 px-0 xl:w-auto xl:px-3 text-foreground hover:text-foreground"
                                    onClick={() => {
                                        void handleBugReportsClick();
                                    }}
                                >
                                    <Bug className="h-4 w-4"/>
                                    <span className="hidden xl:inline">Report bug</span>
                                </Button>
                            </div>
                            {!isGuest && <NotificationBell/>}
                            {!isGuest && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="glass-control"
                                    aria-label="Settings"
                                    title="Settings"
                                    onClick={() =>
                                        open(
                                            <SettingsComponent/>,
                                            {title: 'Settings', className: 'h-dvh w-screen max-w-none overflow-hidden rounded-none border-0 p-0 sm:h-[min(760px,90dvh)] sm:w-[92vw] sm:max-w-5xl sm:rounded-2xl'}
                                        )
                                    }
                                >
                                    <Settings className="h-6 w-6"/>
                                </Button>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="glass-control" aria-label="Menu"
                                            title="Menu">
                                        <MoreVertical className="h-6 w-6"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-popover">
                                    {isGuest && (
                                        <DropdownMenuItem className="cursor-pointer gap-2"
                                                          onSelect={() => {
                                                              setTimeout(() => open(
                                                                  <div className="w-[80vw] max-w-sm">
                                                                      <RoomTabOrderSettings/>
                                                                  </div>
                                                              ), 100);
                                                          }}>
                                            <ArrowDownAZ className="h-4 w-4"/>
                                            Room tab order
                                        </DropdownMenuItem>
                                    )}
                                    {!isStaffOrHigher && (
                                        <DropdownMenuItem className="cursor-pointer gap-2 md:hidden"
                                                          onSelect={handleAdvertiseClick}>
                                            <Megaphone className="h-4 w-4"/>
                                            {advertiseTitle}
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem className="cursor-pointer gap-2 md:hidden"
                                                      onSelect={() => {
                                                          void handleBugReportsClick();
                                                      }}>
                                        <Bug className="h-4 w-4"/>
                                        Report a bug
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer gap-2"
                                                      onSelect={() => {
                                                          // Delay allows the dropdown to close and restore pointer events before dialog opens
                                                          setTimeout(() => open(<div className="max-w-4xl">
                                                              <TermsOfService/></div>), 100);
                                                      }}>
                                        <Book className="h-4 w-4"/>
                                        Terms of Service
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer gap-2"
                                                      onSelect={() => {
                                                          setTimeout(() => open(<div className="max-w-4xl">
                                                              <PrivacyPolicy/></div>), 100);
                                                      }}>
                                        <Shield className="h-4 w-4"/>
                                        Privacy Policy
                                    </DropdownMenuItem>
                                    {!isGuest && (
                                        <DropdownMenuItem
                                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900 gap-2"
                                            onSelect={() => {
                                                setTimeout(() => handleLogout(), 100);
                                            }}>
                                            <LogOut className="h-4 w-4"/>
                                            Logout
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
                <div className="w-full md:hidden"><Button onClick={openPro} className={`${PRO_NAV_BUTTON_CLASS_NAME} h-8 w-full justify-between px-4 text-xs`}><span className="flex items-center gap-2"><Diamond className="h-3.5 w-3.5"/>allchat Pro</span><span className="font-normal text-inherit">{user?.proActive ? 'Your Pro perks' : 'Share more with Pro'}</span></Button></div>
            </nav>

        </div>);
}
