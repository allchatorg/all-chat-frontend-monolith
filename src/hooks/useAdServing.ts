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
import {Message} from '@/models/message';
import {ChatRoom} from '@/models/ChatRoom';
import {selectLoadedChatRooms} from '@/redux/chatRoom/chatRoomSelectors';
import {cacheAdvertMessage} from '@/redux/chatRoom/chatRoomSlice';
import {AdPlacement} from '@/models/AdPlacement';

const AD_EXPIRY_MS = 60 * 60 * 1000;
const AD_FETCH_COOLDOWN_MS = AD_EXPIRY_MS;

type AdChatRoom = Pick<ChatRoom, 'id' | 'name' | 'messages'>;
type GetAdOptions = {
    fetchIfNeeded?: boolean;
};

// Must mirror getAdvertInsertIndex in chatRoomSlice: a placement whose anchor
// is missing from the loaded message window resolves to no insert index there.
function isPlacementValid(placement: AdPlacement, messages: Message[]): boolean {
    const hasNonAdvertMessages = messages.some(message => !message.advert);

    if (placement.afterMessageId === null && placement.beforeMessageId === null) {
        return !hasNonAdvertMessages;
    }

    if (placement.afterMessageId !== null) {
        return messages.some(message => !message.advert && message.id === placement.afterMessageId);
    }

    return messages.some(message => !message.advert && message.id === placement.beforeMessageId);
}

export const useAdServing = () => {
    const dispatch = useDispatch<AppDispatch>();
    const currentAd = useSelector(selectCurrentAd);
    const lastServedTimestamp = useSelector(selectLastServedTimestamp);
    const lastAdFetchTimestamp = useSelector(selectLastAdFetchTimestamp);
    const servedChatroomIds = useSelector(selectServedChatroomIds);
    const status = useSelector(selectAdsStatus);
    const loadedChatRooms = useSelector(selectLoadedChatRooms);
    const adPlacementsByChatroomId = useSelector(selectAdPlacementsByChatroomId);

    const isAdvertCached = useCallback((chatroomId: number, advertId: number) => {
        return loadedChatRooms.some(room =>
            room.id === chatroomId &&
            room.messages.some(message => message.advert && message.id === advertId)
        );
    }, [loadedChatRooms]);

    const createPlacement = useCallback((ad: Message, chatRoom: AdChatRoom): AdPlacement => {
        const chatMessages = chatRoom.messages.filter(message => !message.advert);
        const lastMessage = chatMessages[chatMessages.length - 1] ?? null;

        return {
            adId: ad.id,
            chatRoomId: chatRoom.id,
            afterMessageId: lastMessage?.id ?? null,
            beforeMessageId: null,
            placedAt: new Date().toISOString(),
        };
    }, []);

    const getPlacement = useCallback((ad: Message, chatRoom: AdChatRoom): AdPlacement => {
        const existingPlacement = adPlacementsByChatroomId[chatRoom.id];

        if (existingPlacement?.adId === ad.id && isPlacementValid(existingPlacement, chatRoom.messages)) {
            return existingPlacement;
        }

        const placement = createPlacement(ad, chatRoom);
        dispatch(setAdPlacement(placement));
        return placement;
    }, [adPlacementsByChatroomId, createPlacement, dispatch]);

    const buildAdvertMessage = useCallback((ad: Message, chatRoom: AdChatRoom, placement: AdPlacement): Message => {
        return {
            ...ad,
            chatRoomId: chatRoom.id,
            chatRoomName: chatRoom.name,
            createdAt: new Date(placement.placedAt),
            advert: true,
        };
    }, []);

    const ensureAdvertCached = useCallback((
        ad: Message,
        chatRoom: AdChatRoom,
        placementOverride?: AdPlacement
    ): Message => {
        const placement = placementOverride ?? getPlacement(ad, chatRoom);
        const advertMessage = buildAdvertMessage(ad, chatRoom, placement);

        if (!isAdvertCached(chatRoom.id, advertMessage.id)) {
            dispatch(cacheAdvertMessage({advertMessage, placement}));
        }

        return advertMessage;
    }, [buildAdvertMessage, dispatch, getPlacement, isAdvertCached]);

    const getAd = useCallback(async (
        chatRoom: AdChatRoom,
        {fetchIfNeeded = true}: GetAdOptions = {}
    ): Promise<Message | null> => {
        const chatroomId = chatRoom.id;
        const now = Date.now();

        if (currentAd && lastServedTimestamp) {
            const timeDiff = now - lastServedTimestamp;
            const isExpired = timeDiff > AD_EXPIRY_MS;
            const hasBeenServedInChatroom = servedChatroomIds.includes(chatroomId);
            const isCachedInChatroom = isAdvertCached(chatroomId, currentAd.id);

            if (!isExpired) {
                if (!hasBeenServedInChatroom) {
                    dispatch(markServedAction(chatroomId));
                    return ensureAdvertCached(currentAd, chatRoom);
                }

                if (!isCachedInChatroom) {
                    return ensureAdvertCached(currentAd, chatRoom);
                }

                return null;
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
                    const placement = createPlacement(newAd, chatRoom);
                    dispatch(setAdPlacement(placement));
                    return ensureAdvertCached(newAd, chatRoom, placement);
                }

                // 204 — no paid campaigns running: fall back to a locally
                // built filler/house ad (random text/photo/video creative).
                // It becomes currentAd, so the branch above serves it
                // per-chatroom until expiry, when a real fetch runs again
                // and any new paid ad replaces it.
                const filler = buildFillerAdMessage();
                dispatch(setFillerAd(filler));
                dispatch(markServedAction(chatroomId));
                const placement = createPlacement(filler, chatRoom);
                dispatch(setAdPlacement(placement));
                return ensureAdvertCached(filler, chatRoom, placement);
            }
        } catch (error) {
            console.error("Failed to fetch ad", error);
        }

        return null;

    }, [createPlacement, currentAd, dispatch, ensureAdvertCached, isAdvertCached, lastAdFetchTimestamp, lastServedTimestamp, servedChatroomIds, status]);

    return {getAd, currentAd, status};
};
