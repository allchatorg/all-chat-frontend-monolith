import {createAsyncThunk} from "@reduxjs/toolkit";
import {MessagingAvailability} from "@/models/MessagingAvailability";
import {getMessagingAvailability} from "@/api/chatting/chattingAPI";

export const fetchMessagingAvailabilityThunk = createAsyncThunk<MessagingAvailability>(
    "messagingAvailability/fetch",
    async (_, {rejectWithValue}) => {
        try {
            return await getMessagingAvailability();
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
