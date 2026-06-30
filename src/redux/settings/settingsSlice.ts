import {Tag} from "@/models/Tag";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {getAllAttachmentTypesThunk, getAllTagsThunk} from "@/redux/settings/settingsThunk";
import {AttachmentType} from "@/models/AttachmentType";
import {ActiveRightPanel} from "@/models/ActiveRightPanel";
import {ActiveLeftPanel} from "@/models/ActiveLeftPanel";

interface AttachmentTypesState {
    attachmentTypes: AttachmentType[];
    isLoading: boolean;
    error: string | null;
}

interface SettingsState {
    theme: string;
    blurredContent: Tag[];
    attachmentTypesState: AttachmentTypesState;
    activeRightPanel: ActiveRightPanel | null;
    activeLeftPanel: ActiveLeftPanel | null;
    chatRoomSoundSetting: Record<number, Record<number, boolean>>;
    userDisplayColor: string;
    mediaPlayerMuted: boolean;
    showAppBackground: boolean;
}

const initialState: SettingsState = {
    theme: "light",
    blurredContent: [],
    attachmentTypesState: {
        attachmentTypes: [],
        isLoading: false,
        error: null
    },
    activeRightPanel: 'top-online',
    activeLeftPanel: 'top-reacted-messages',
    chatRoomSoundSetting: {},
    userDisplayColor: "#000000",
    mediaPlayerMuted: true,
    showAppBackground: true
};

const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        setTheme(state, action) {
            state.theme = action.payload.theme;
        },
        setBlurredContent(state, action: PayloadAction<Tag[]>) {
            state.blurredContent = action.payload;
        },
        setActiveRightSidebar(state, action: PayloadAction<ActiveRightPanel | null>) {
            state.activeRightPanel = action.payload;
        },
        setActiveLeftSidebar(state, action: PayloadAction<ActiveLeftPanel | null>) {
            state.activeLeftPanel = action.payload;
        },
        setSoundSettings(state, action: PayloadAction<{
            userId: number | null | undefined;
            id: number;
            isEnabled: boolean
        }>) {
            const {userId, id, isEnabled} = action.payload;
            if (userId == null) {
                return;
            }
            if (!state.chatRoomSoundSetting[userId]) {
                state.chatRoomSoundSetting[userId] = {};
            }
            state.chatRoomSoundSetting[userId][id] = isEnabled;
        },
        setMediaPlayerMuted(state, action: PayloadAction<boolean>) {
            state.mediaPlayerMuted = action.payload;
        },
        setShowAppBackground(state, action: PayloadAction<boolean>) {
            state.showAppBackground = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllTagsThunk.fulfilled, (state, action) => {
                state.blurredContent = action.payload;
            })
            .addCase(getAllAttachmentTypesThunk.fulfilled, (state, action) => {
                state.attachmentTypesState.attachmentTypes = action.payload;
            })
            .addCase(getAllAttachmentTypesThunk.pending, (state) => {
                state.attachmentTypesState.isLoading = true;
                state.attachmentTypesState.error = null;
            })
            .addCase(getAllAttachmentTypesThunk.rejected, (state, action) => {
                state.attachmentTypesState.isLoading = false;
                state.attachmentTypesState.error = action.payload as string;
            })
    }
});

export const {
    setTheme,
    setBlurredContent,
    setActiveRightSidebar,
    setActiveLeftSidebar,
    setSoundSettings,
    setMediaPlayerMuted,
    setShowAppBackground
} = settingsSlice.actions;

export default settingsSlice.reducer;
