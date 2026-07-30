import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {setNotificationSoundMode, setSoundSettings} from '@/redux/settings/settingsSlice';
import {AppDispatch, RootState} from '@/redux/store';
import {DEFAULT_NOTIFICATION_SOUND_MODE, NotificationSoundMode} from '@/models/NotificationSoundMode';

export const useChatRoomSoundSettings = () => {
    const dispatch = useDispatch<AppDispatch>();
    const userId = useSelector((state: RootState) => state.user.user?.id);
    const chatRoomSoundSetting = useSelector((state: RootState) => state.settings.chatRoomSoundSetting);
    const notificationSoundMode = useSelector((state: RootState) => state.settings.notificationSoundMode);
    const focusedChatRoomId = useSelector((state: RootState) => state.chatRoom.selectedUserChatRoom?.chatRoomId ?? null);
    const selectedPrivateChatId = useSelector((state: RootState) => state.privateChat.selectedChatId);

    const soundMode: NotificationSoundMode =
        userId == null
            ? DEFAULT_NOTIFICATION_SOUND_MODE
            : (notificationSoundMode[userId] ?? DEFAULT_NOTIFICATION_SOUND_MODE);

    const setSoundMode = (mode: NotificationSoundMode) => {
        if (userId == null) return; // cannot change mode without a user context
        dispatch(setNotificationSoundMode({userId, mode}));
    };

    const getMuted = (id: number): boolean => {
        if (userId == null) return true;
        const userSettings = chatRoomSoundSetting[userId] || {};
        return userSettings[id] ?? true;
    };

    const toggleSound = (id: number) => {
        if (userId == null) return; // cannot toggle without a user context
        const userSettings = chatRoomSoundSetting[userId] || {};
        const isCurrentlyEnabled = userSettings[id] ?? true;
        dispatch(setSoundSettings({userId, id, isEnabled: !isCurrentlyEnabled}));
    };

    const canPlaySound = useCallback((id: number, kind: 'public' | 'private'): boolean => {
        if (userId == null) return false;
        if (soundMode === 'MUTED') return false;
        if (soundMode === 'FOCUSED') {
            const focusedId = kind === 'public' ? focusedChatRoomId : selectedPrivateChatId;
            return id === focusedId;
        }
        const userSettings = chatRoomSoundSetting[userId] || {};
        return !(userSettings[id] ?? true);
    }, [userId, soundMode, focusedChatRoomId, selectedPrivateChatId, chatRoomSoundSetting]);

    return {getMuted, toggleSound, chatRoomSoundSetting, soundMode, setSoundMode, canPlaySound};
};
