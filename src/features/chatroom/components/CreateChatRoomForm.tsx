"use client";

import {useId} from "react";
import {Check, Eye, Info, Loader2, MessageSquare, MessageSquarePlus} from "lucide-react";
import {GuestModalWrapper} from "@/components/GuestModalWrapper";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {RoomProBadge} from "@/components/RoomProBadge";
import {cn} from "@/lib/utils";

interface CreateChatRoomFormProps {
    name: string;
    proOnly: boolean;
    proModeLocked: boolean;
    isPro: boolean;
    canCreate: boolean;
    isCreating: boolean;
    error: string | null;
    isGuest: boolean;
    onCreate: () => void;
    onProOnlyChange: (checked: boolean) => void;
}

const PRO_ROOM_HINT = "Only PRO members can participate. Everyone can read and report.";
const iconButtonClassName = "flex shrink-0 cursor-pointer items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-default motion-reduce:transition-none";

/** Compact dashed create card in the room search results, shared by desktop and mobile. */
export function CreateChatRoomForm({name, proOnly, proModeLocked, isPro, canCreate, isCreating, error,
    isGuest, onCreate, onProOnlyChange}: CreateChatRoomFormProps) {
    const descriptionId = useId();
    const lockedReason = proModeLocked
        ? proOnly
            ? `"${name}" already exists as a standard chatroom, so it can only be created as PRO-only.`
            : `"${name}" already exists as a PRO-only chatroom, so it can only be created as a standard one.`
        : null;
    const createLabel = isCreating ? "Creating…"
        : proOnly && !isPro ? `Get PRO to create "${name}"` : `Create chatroom "${name}"`;

    return <div className="glass-surface overflow-hidden rounded-lg border-dashed">
        <div className={cn("flex items-center gap-1 p-1 transition-colors motion-reduce:transition-none",
            proOnly && "bg-blue-500/5 dark:bg-blue-400/5")}>
            <GuestModalWrapper isGuest={isGuest}>
                <button type="button" onClick={onCreate} disabled={!canCreate} aria-busy={isCreating}
                    aria-label={proOnly && isPro && !isCreating ? `Create PRO-only chatroom "${name}"` : undefined}
                    className="flex min-h-9 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-2 text-left text-sm transition-colors enabled:hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-default dark:enabled:hover:bg-white/5 motion-reduce:transition-none">
                    {isCreating
                        ? <Loader2 aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin"/>
                        : <MessageSquarePlus aria-hidden="true" className={cn("h-4 w-4 shrink-0 transition-colors motion-reduce:transition-none",
                            proOnly && "text-blue-600 dark:text-blue-400")}/>}
                    <span className="min-w-0 truncate text-foreground">{createLabel}</span>
                </button>
            </GuestModalWrapper>
            <button type="button" role="switch" aria-checked={proOnly} aria-label="PRO-only room"
                aria-describedby={descriptionId} disabled={isCreating || proModeLocked}
                onClick={() => onProOnlyChange(!proOnly)}
                className={cn(iconButtonClassName, "min-h-9 gap-1.5 px-2 enabled:hover:bg-blue-500/10")}>
                <span aria-hidden="true" className="flex"><RoomProBadge proOnly active={proOnly}/></span>
                <span aria-hidden="true" className={cn("flex h-4 w-7 items-center rounded-full p-0.5 transition-colors motion-reduce:transition-none",
                    proOnly ? "bg-blue-600" : "bg-slate-400 dark:bg-slate-600", proModeLocked && "opacity-50")}>
                    <span className={cn("flex h-3 w-3 items-center justify-center rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none",
                        proOnly && "translate-x-3")}>
                        {proOnly && <Check className="h-2.5 w-2.5 text-blue-700" strokeWidth={3}/>}
                    </span>
                </span>
            </button>
            <span id={descriptionId} className="sr-only">{lockedReason ?? PRO_ROOM_HINT}</span>
            <Popover>
                <PopoverTrigger asChild>
                    <button type="button" aria-label="What is a PRO-only chatroom?"
                        className={cn(iconButtonClassName, "h-9 w-9 justify-center text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5")}>
                        <Info aria-hidden="true" className="h-4 w-4"/>
                    </button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="end" className="w-64 space-y-2.5 p-3">
                    <p className="flex items-center gap-2 text-sm font-medium">
                        <span aria-hidden="true" className="flex"><RoomProBadge proOnly/></span>PRO-only chatroom
                    </p>
                    <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                        <li className="flex gap-2"><Eye aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0"/>
                            Everyone can find it, read the messages and report content.</li>
                        <li className="flex gap-2"><MessageSquare aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0"/>
                            Only PRO members can post, reply, react and promote in it.</li>
                    </ul>
                    {(lockedReason || !isPro) && <p className="border-t border-(--glass-border) pt-2 text-xs leading-relaxed text-muted-foreground">
                        {lockedReason ?? "Creating one requires PRO."}
                    </p>}
                </PopoverContent>
            </Popover>
        </div>
        {error && <p role="alert" className="border-t border-dashed border-(--glass-border) px-3 py-1.5 text-xs text-destructive">{error}</p>}
    </div>;
}
