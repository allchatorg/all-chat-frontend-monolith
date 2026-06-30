import {RootState} from "@/redux/store";

export const selectMessagingAvailability = (state: RootState) =>
    state.messagingAvailability.availability;

export const selectMessagingAvailabilityLoading = (state: RootState) =>
    state.messagingAvailability.loading;
