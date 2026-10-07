"use client";

import {useId} from "react";
import {ArrowRight, Check, Loader2} from "lucide-react";
import {GuestModalWrapper} from "@/components/GuestModalWrapper";
import {RoomProBadge} from "@/components/RoomProBadge";
import {cn} from "@/lib/utils";

interface CreateChatRoomFormProps {
    name: string;
    hasMatches: boolean;
    proOnly: boolean;
    canCreate: boolean;
    selectedModeExists: boolean;
    isCreating: boolean;
    error: string | null;
    isGuest: boolean;
    onCreate: () => void;
    onProOnlyChange: (checked: boolean) => void;
}

/** Inline creation card in the room search results, shared by desktop and mobile. */
export function CreateChatRoomForm({name, hasMatches, proOnly, canCreate, selectedModeExists,
    isCreating, error, isGuest, onCreate, onProOnlyChange}: CreateChatRoomFormProps) {
    const descriptionId = useId();
    return <div className="glass-surface rounded-lg px-3 pt-3 pb-1">
        <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{hasMatches ? "Create chatroom" : "No matching chatroom"}</p>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground" title={name}>{name}</p>
        </div>
        <p id={descriptionId} className={cn("text-xs leading-relaxed text-muted-foreground", proOnly ? "mt-1" : "sr-only")}>
            Only PRO members can participate. Everyone can read and report.
        </p>
        {selectedModeExists && <p role="status" className="mt-1 text-xs text-muted-foreground">This room type already exists.</p>}
        <div className="-mx-1 flex items-center justify-between gap-2">
            <button type="button" role="switch" aria-checked={proOnly} aria-label="PRO-only room"
                aria-describedby={descriptionId} disabled={isCreating} onClick={() => onProOnlyChange(!proOnly)}
                title="Only PRO members can participate. Everyone can read and report."
                className="group flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-1 transition-colors enabled:hover:bg-blue-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-default disabled:opacity-50 motion-reduce:transition-none">
                <span aria-hidden="true"><RoomProBadge proOnly active={proOnly}/></span>
                <span aria-hidden="true" className={cn("flex h-4 w-7 items-center rounded-full p-0.5 transition-colors motion-reduce:transition-none", proOnly ? "bg-blue-600 group-enabled:group-hover:bg-blue-700" : "bg-slate-400 dark:bg-slate-600")}>
                    <span className={cn("flex h-3 w-3 items-center justify-center rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none", proOnly && "translate-x-3")}>
                        {proOnly && <Check className="h-2.5 w-2.5 text-blue-700" strokeWidth={3}/>}
                    </span>
                </span>
            </button>
            <GuestModalWrapper isGuest={isGuest}>
                <button type="button" onClick={onCreate} disabled={!canCreate}
                    aria-label={`Create ${proOnly ? "PRO-only " : ""}room ${name}`}
                    className="flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-md px-1 text-xs font-medium text-blue-700 transition-colors enabled:hover:bg-blue-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-default disabled:opacity-50 dark:text-blue-300 motion-reduce:transition-none">
                    {isCreating && <Loader2 aria-hidden="true" className="h-3 w-3 animate-spin"/>}
                    {isCreating ? "Creating…" : "Create room"}
                    {!isCreating && <ArrowRight aria-hidden="true" className="h-3 w-3"/>}
                </button>
            </GuestModalWrapper>
        </div>
        {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
    </div>;
}
