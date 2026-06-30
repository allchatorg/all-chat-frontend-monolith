import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {MessagingAvailability} from "@/models/MessagingAvailability";
import {fetchMessagingAvailabilityThunk} from "@/redux/messagingAvailability/messagingAvailabilityThunk";

interface MessagingAvailabilityState {
    availability: MessagingAvailability;
    loading: boolean;
    error: string | null;
}

const initialState: MessagingAvailabilityState = {
    availability: {
        messagingBlocked: false,
        disabledReason: null,
    },
    loading: false,
    error: null,
};

const messagingAvailabilitySlice = createSlice({
    name: "messagingAvailability",
    initialState,
    reducers: {
        setMessagingAvailability(state, action: PayloadAction<MessagingAvailability>) {
            state.availability = action.payload;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMessagingAvailabilityThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMessagingAvailabilityThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.availability = action.payload;
            })
            .addCase(fetchMessagingAvailabilityThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {setMessagingAvailability} = messagingAvailabilitySlice.actions;
export default messagingAvailabilitySlice.reducer;
