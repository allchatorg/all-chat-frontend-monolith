import {useDispatch, useSelector} from 'react-redux';
import {setSoundSettings} from '@/redux/settings/settingsSlice';
import {AppDispatch, RootState} from '@/redux/store';

export const useChatRoomSoundSettings = () => {
    const dispatch = useDispatch<AppDispatch>();
    const userId = useSelector((state: RootState) => state.user.user?.id);
    const chatRoomSoundSetting = useSelector((state: RootState) => state.settings.chatRoomSoundSetting);

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

    return {getMuted, toggleSound, chatRoomSoundSetting};
};