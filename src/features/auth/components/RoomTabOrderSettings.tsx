"use client";

import {useId} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {selectChatRoomTabSortMode} from "@/redux/chatRoom/chatRoomSelectors";
import {setChatRoomTabSortMode} from "@/redux/chatRoom/chatRoomUiSlice";
import type {AppDispatch} from "@/redux/store";

export const RoomTabOrderSettings = () => {
    const id = useId();
    const sortMode = useSelector(selectChatRoomTabSortMode);
    const dispatch: AppDispatch = useDispatch();

    return (
        <div className="space-y-2">
            <Label id={`${id}-label`} htmlFor={id}>Room tab order</Label>
            <Select
                value={sortMode}
                onValueChange={(value) => {
                    if (value === "manual" || value === "alphabetical") {
                        dispatch(setChatRoomTabSortMode(value));
                    }
                }}
            >
                <SelectTrigger id={id} aria-labelledby={`${id}-label`} aria-describedby={`${id}-description`}>
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical (A–Z)</SelectItem>
                </SelectContent>
            </Select>
            <p id={`${id}-description`} className="text-[0.8rem] text-muted-foreground">
                Choose Manual to drag tabs into place. Switching to A–Z keeps your manual order saved.
            </p>
        </div>
    );
};
