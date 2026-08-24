import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch} from '@/redux/store';
import {
    selectAdPlacementsByChatroomId,
    selectAdsStatus,
    selectCurrentAd,
    selectLastAdFetchTimestamp,
    selectLastServedTimestamp,
    selectServedChatroomIds,
} from '@/redux/ads/adsSelectors';
import {fetchAd} from '@/redux/ads/adsThunk';
import {markChatroomAsServed as markServedAction, setAdPlacement, setFillerAd} from '@/redux/ads/adsSlice';
import {buildFillerAdMessage} from '@/features/chatroom/utils/fillerAds';
import {AdChatRoom, createPlacement, getAdvertInsertIndex, isAnchorDeleted} from '@/features/chatroom/utils/adPlacement';
import {Message} from '@/models/message';

const AD_EXPIRY_MS = 60 * 60 * 1000;
const AD_FETCH_COOLDOWN_MS = AD_EXPIRY_MS;

type GetAdOptions = {
    fetchIfNeeded?: boolean;
};

export const useAdServing = () => {
    const dispatch = useDispatch<AppDispatch>();
    const currentAd = useSelector(selectCurrentAd);
    const lastServedTimestamp = useSelector(selectLastServedTimestamp);
    const lastAdFetchTimestamp = useSelector(selectLastAdFetchTimestamp);
    const servedChatroomIds = useSelector(selectServedChatroomIds);
    const status = useSelector(selectAdsStatus);
    const adPlacementsByChatroomId = useSelector(selectAdPlacementsByChatroomId);

    // Creates the placement once per ad/room and re-anchors to the tail only when
    // the anchor message was deleted (what composeMessagesWithAd already renders).
    const ensurePlacement = useCallback((ad: Message, chatRoom: AdChatRoom) => {
        const existingPlacement = adPlacementsByChatroomId[chatRoom.id];

        if (existingPlacement?.adId === ad.id) {
            // Empty-room placement: once the first message exists, pin the advert
            // before it so it keeps that top position instead of following the tail.
            if (existingPlacement.afterMessageId === null && existingPlacement.beforeMessageId === null) {
                const firstMessage = chatRoom.messages.find(message => !message.advert);
                if (firstMessage) {
                    dispatch(setAdPlacement({...existingPlacement, beforeMessageId: firstMessage.id}));
                }
                return;
            }

            // Keep the placement unless the anchor is provably deleted; an anchor that
            // is simply outside the loaded window must not move the advert.
            if (getAdvertInsertIndex(chatRoom.messages, existingPlacement) !== null || !isAnchorDeleted(chatRoom, existingPlacement)) {
                return;
            }
        }

        dispatch(setAdPlacement(createPlacement(ad, chatRoom)));
    }, [adPlacementsByChatroomId, dispatch]);

    const getAd = useCallback(async (
        chatRoom: AdChatRoom,
        {fetchIfNeeded = true}: GetAdOptions = {}
    ): Promise<Message | null> => {
        const chatroomId = chatRoom.id;
        const now = Date.now();

        if (currentAd && lastServedTimestamp) {
            const isExpired = now - lastServedTimestamp > AD_EXPIRY_MS;

            if (!isExpired) {
                if (!servedChatroomIds.includes(chatroomId)) {
                    dispatch(markServedAction(chatroomId));
                }
                ensurePlacement(currentAd, chatRoom);
                return currentAd;
            }
        }

        if (!fetchIfNeeded || status === 'loading') {
            return null;
        }

        if (!currentAd && lastAdFetchTimestamp && now - lastAdFetchTimestamp < AD_FETCH_COOLDOWN_MS) {
            return null;
        }

        try {
            const resultAction = await dispatch(fetchAd());
            if (fetchAd.fulfilled.match(resultAction)) {
                const newAd = resultAction.payload;
                if (newAd) {
                    dispatch(markServedAction(chatroomId));
                    dispatch(setAdPlacement(createPlacement(newAd, chatRoom)));
                    return newAd;
                }

                // 204 — no paid campaigns running: fall back to a locally
                // built filler/house ad (random text/photo/video creative).
                // It becomes currentAd, so the branch above serves it
                // per-chatroom until expiry, when a real fetch runs again
                // and any new paid ad replaces it.
                const filler = buildFillerAdMessage();
                dispatch(setFillerAd(filler));
                dispatch(markServedAction(chatroomId));
                dispatch(setAdPlacement(createPlacement(filler, chatRoom)));
                return filler;
            }
        } catch (error) {
            console.error("Failed to fetch ad", error);
        }

        return null;

    }, [currentAd, dispatch, ensurePlacement, lastAdFetchTimestamp, lastServedTimestamp, servedChatroomIds, status]);

    return {getAd, currentAd, status};
};
