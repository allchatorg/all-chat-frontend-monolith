import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Message} from '@/models/message';
import {fetchAd} from './adsThunk';
import {AdPlacement} from '@/models/AdPlacement';

interface AdsState {
    currentAd: Message | null;
    lastServedTimestamp: number | null; // Unix timestamp
    lastAdFetchTimestamp: number | null; // Unix timestamp
    servedChatroomIds: number[]; // List of chatroom IDs
    adPlacementsByChatroomId: Record<number, AdPlacement>;
    hiddenAdIds: number[]; // List of hidden ad message IDs
    clickedAdIds: number[]; // Ad IDs already click-tracked for the current served ad
    status: 'idle' | 'loading' | 'failed';
}

const initialState: AdsState = {
    currentAd: null,
    lastServedTimestamp: null,
    lastAdFetchTimestamp: null,
    servedChatroomIds: [],
    adPlacementsByChatroomId: {},
    hiddenAdIds: [],
    clickedAdIds: [],
    status: 'idle',
};

const adsSlice = createSlice({
    name: 'ads',
    initialState,
    reducers: {
        markChatroomAsServed: (state, action: PayloadAction<number>) => {
            if (!state.servedChatroomIds.includes(action.payload)) {
                state.servedChatroomIds.push(action.payload);
            }
        },
        hideAd: (state, action: PayloadAction<number>) => {
            if (!state.hiddenAdIds.includes(action.payload)) {
                state.hiddenAdIds.push(action.payload);
            }
        },
        setAdPlacement: (state, action: PayloadAction<AdPlacement>) => {
            state.adPlacementsByChatroomId[action.payload.chatRoomId] = action.payload;
        },
        markAdClicked: (state, action: PayloadAction<number>) => {
            if (!state.clickedAdIds.includes(action.payload)) {
                state.clickedAdIds.push(action.payload);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAd.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAd.fulfilled, (state, action) => {
                const fetchedAt = Date.now();
                state.status = 'idle';
                state.lastAdFetchTimestamp = fetchedAt;
                state.currentAd = action.payload;
                // If we got a new ad, reset the tracking
                if (action.payload) {
                    state.lastServedTimestamp = fetchedAt;
                    state.servedChatroomIds = [];
                    state.adPlacementsByChatroomId = {};
                    state.hiddenAdIds = [];
                    state.clickedAdIds = [];
                }
            })
            .addCase(fetchAd.rejected, (state) => {
                state.status = 'failed';
            });
    },
});

export const {markChatroomAsServed, hideAd, setAdPlacement, markAdClicked} = adsSlice.actions;
export default adsSlice.reducer;
