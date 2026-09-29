"use client";
import {Button} from "@/components/ui/button";
import {ArrowDownAZ, Book, Bug, Diamond, LogOut, Megaphone, Menu, MoreVertical, Settings, Shield, Shuffle} from "lucide-react";
import Image from "next/image";
import {usePathname, useRouter} from "next/navigation";
import {useDialog} from "./providers/DialogProvider";
import {useDispatch, useSelector} from "react-redux";
import {selectUser} from "@/redux/user/userSelectors";
import {SettingsComponent} from "@/features/auth/components/SettingsComponent";
import {RoomTabOrderSettings} from "@/features/auth/components/RoomTabOrderSettings";
import {AppDispatch} from "@/redux/store";
import {useRef, useState} from "react";
import {useThemedLogo} from "@/lib/hooks/useThemedLogo";
import SearchRooms from "@/features/chatroom/components/SearchRooms";
import SearchUsers from "@/features/privateChat/components/SearchUsers";
import {logoutThunk} from "@/redux/auth/authThunk";
import {isAuthFlowRoute, ROUTES} from "@/routes";
import {Role} from "@/models/Role";
import {ConfirmModal} from "@/components/ConfirmModal";
import ClaimAccountBanner from "@/components/ClaimAccountBanner";
import {Sheet, SheetContent, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
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
import {useJoinRandomRoom} from '@/features/chatroom/hooks/useJoinRandomRoom';
import {useIsMobile} from '@/lib/hooks/useIsMobile';

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
    const menuTriggerRef = useRef<HTMLButtonElement>(null);
    const isMobile = useIsMobile();
    const logoSrc = useThemedLogo();

    const openPro = useProDialog();
    const {handleJoinRandomRoom, joinRandomRoomIsLoading} = useJoinRandomRoom();

    const handleOpenSettings = () => open(
        <SettingsComponent/>,
        {title: 'Settings', allowStripe: true, className: 'h-dvh w-screen max-w-none overflow-hidden rounded-none border-0 p-0 sm:h-[min(760px,90dvh)] sm:w-[92vw] sm:max-w-5xl sm:rounded-2xl'}
    );

    // Let the dropdown release its focus trap before opening another surface.
    const afterMenuCloses = (action: () => void) => setTimeout(action, 100);

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
                className="navbar-floating relative grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 py-2 lg:h-16 lg:px-4
             bg-transparent border-0 shadow-none lg:gap-x-3 lg:gap-y-0
             lg:grid-cols-[minmax(0,1fr)_minmax(0,min(30.5rem,calc(100%-40rem)))_minmax(0,1fr)] xl:gap-x-6">
                <div className="col-start-2 row-start-1 flex min-w-0 items-center justify-center gap-2 lg:col-start-1 lg:justify-start xl:gap-3">
                    {isStaffMember() && (
                        <div className="hidden lg:block">
                            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="glass-control"
                                            aria-label="Open sidebar" title="Open sidebar">
                                        <Menu className="h-6 w-6"/>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-[300px]"
                                              aria-describedby={undefined}
                                              onCloseAutoFocus={event => {
                                                  if (isMobile) {
                                                      event.preventDefault();
                                                      menuTriggerRef.current?.focus();
                                                  }
                                              }}>
                                    <SheetTitle className="sr-only">Navigation</SheetTitle>
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
                        className="h-8 w-auto shrink-0 lg:h-9"
                        onClick={() => {
                            router.push(ROUTES.HOME)
                        }}
                    />
                    {isOnHomePage && shouldShowModButton && (
                        <Button
                            variant="outline"
                            aria-label="Become a mod"
                            title="Become a mod"
                            className="glass-control hidden h-9 w-9 shrink-0 px-0 lg:inline-flex xl:w-auto xl:px-3 text-foreground hover:text-foreground"
                            onClick={handleApplyModClick}
                        >
                            <Shield className="h-4 w-4"/>
                            <span className="hidden xl:inline">Become a mod</span>
                        </Button>
                    )}
                </div>

                {/* Equal side columns center the mobile logo and the desktop search field. */}
                <div className="col-start-1 row-start-1 min-w-0 lg:col-start-2">
                    {user && isOnHomePage && (
                        <div className="flex min-w-0 justify-start lg:mx-auto lg:w-full lg:max-w-[30.5rem] lg:justify-center">
                            <SearchRooms/>
                        </div>
                    )}
                    {user && isOnPrivateChatPage && canUsePrivateChat && (
                        <div className="flex min-w-0 justify-start lg:mx-auto lg:w-full lg:max-w-[25rem] lg:justify-center">
                            <SearchUsers/>
                        </div>
                    )}
                </div>

                <div className="col-start-3 row-start-1 flex min-w-0 items-center justify-self-end">
                    {user && (
                        <div className="flex shrink-0 items-center gap-1 lg:gap-2">
                            {!isStaffOrHigher && <Button onClick={openPro} aria-label="Explore allchat Pro" className={`${PRO_NAV_BUTTON_CLASS_NAME} hidden h-9 shrink-0 gap-2 px-3 lg:inline-flex`}><Diamond className="h-4 w-4"/><span><span className="hidden xl:inline">allchat </span>Pro</span></Button>}
                            <div className="hidden shrink-0 lg:flex items-center gap-2">
                                {!isStaffOrHigher && (
                                    <Button
                                        variant="outline"
                                        aria-label={advertiseTitle}
                                        title={advertiseTitle}
                                        className="glass-control h-9 w-9 px-0 min-[100rem]:w-auto min-[100rem]:px-3 text-foreground hover:text-foreground"
                                        onClick={handleAdvertiseClick}
                                    >
                                        <Megaphone className="h-4 w-4"/>
                                        <span className="hidden min-[100rem]:inline">{advertiseLabel}</span>
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    aria-label="Report a bug"
                                    title="Report a bug"
                                    className="glass-control h-9 w-9 px-0 min-[100rem]:w-auto min-[100rem]:px-3 text-foreground hover:text-foreground"
                                    onClick={() => {
                                        void handleBugReportsClick();
                                    }}
                                >
                                    <Bug className="h-4 w-4"/>
                                    <span className="hidden min-[100rem]:inline">Report bug</span>
                                </Button>
                            </div>
                            {!isGuest && <NotificationBell/>}
                            {!isGuest && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="glass-control hidden lg:inline-flex"
                                    aria-label="Settings"
                                    title="Settings"
                                    onClick={handleOpenSettings}
                                >
                                    <Settings className="h-6 w-6"/>
                                </Button>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button ref={menuTriggerRef} variant="ghost" size="icon" className="glass-control h-10 w-10 shrink-0 lg:h-9 lg:w-9" aria-label="Menu"
                                            title="Menu">
                                        <MoreVertical className="h-6 w-6"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-popover max-w-[calc(100vw-24px)] max-lg:[&_[role=menuitem]]:min-h-10">
                                    {!isGuest && (
                                        <DropdownMenuItem className="cursor-pointer gap-2 lg:hidden"
                                                          onSelect={() => afterMenuCloses(handleOpenSettings)}>
                                            <Settings className="h-4 w-4"/>
                                            Settings
                                        </DropdownMenuItem>
                                    )}
                                    {isOnHomePage && (
                                        <DropdownMenuItem className="cursor-pointer gap-2 lg:hidden"
                                                          disabled={joinRandomRoomIsLoading}
                                                          onSelect={() => {
                                                              void handleJoinRandomRoom().catch(() => {
                                                                  // The shared action displays the error toast.
                                                              });
                                                          }}>
                                            <Shuffle className="h-4 w-4"/>
                                            Join a random chatroom
                                        </DropdownMenuItem>
                                    )}
                                    {isOnHomePage && shouldShowModButton && (
                                        <DropdownMenuItem className="cursor-pointer gap-2 lg:hidden"
                                                          onSelect={() => afterMenuCloses(handleApplyModClick)}>
                                            <Shield className="h-4 w-4"/>
                                            Become a mod
                                        </DropdownMenuItem>
                                    )}
                                    {isStaffMember() && (
                                        <DropdownMenuItem className="cursor-pointer gap-2 lg:hidden"
                                                          onSelect={() => afterMenuCloses(() => setIsSidebarOpen(true))}>
                                            <Menu className="h-4 w-4"/>
                                            Open sidebar
                                        </DropdownMenuItem>
                                    )}
                                    {!isStaffOrHigher && (
                                        <DropdownMenuItem className="cursor-pointer gap-2 lg:hidden"
                                                          onSelect={() => afterMenuCloses(openPro)}>
                                            <Diamond className="h-4 w-4"/>
                                            allchat Pro
                                        </DropdownMenuItem>
                                    )}
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
                                        <DropdownMenuItem className="cursor-pointer gap-2 lg:hidden"
                                                          onSelect={handleAdvertiseClick}>
                                            <Megaphone className="h-4 w-4"/>
                                            {advertiseTitle}
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem className="cursor-pointer gap-2 lg:hidden"
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
            </nav>

        </div>);
}
