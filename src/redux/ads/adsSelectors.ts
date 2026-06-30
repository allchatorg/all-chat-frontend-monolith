import {RootState} from '@/redux/store';

export const selectCurrentAd = (state: RootState) => state.ads.currentAd;
export const selectLastServedTimestamp = (state: RootState) => state.ads.lastServedTimestamp;
export const selectLastAdFetchTimestamp = (state: RootState) => state.ads.lastAdFetchTimestamp;
export const selectServedChatroomIds = (state: RootState) => state.ads.servedChatroomIds;
export const selectAdPlacementsByChatroomId = (state: RootState) => state.ads.adPlacementsByChatroomId;
export const selectHiddenAdIds = (state: RootState) => state.ads.hiddenAdIds;
export const selectAdsStatus = (state: RootState) => state.ads.status;
