import {combineReducers, configureStore, createAction} from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import authReducer from "./auth/authSlice"
import chatRoomReducer from "@/redux/chatRoom/chatRoomSlice";
import chatRoomUiReducer from "@/redux/chatRoom/chatRoomUiSlice";
import settingsReducer from "@/redux/settings/settingsSlice";
import {deleteAccountThunk} from "@/redux/user/usersThunk";
import {modPanelReducer} from "@/redux/modPanel/modPanelSlice";
import {adminReducer} from "@/redux/admin/adminSlice";
import storage from "redux-persist/lib/storage";
import {persistReducer, persistStore} from "redux-persist";
import {logoutThunk} from "@/redux/auth/authThunk";
import {reportCasesReducer} from "@/redux/report-cases/reportCasesSlice";
import {appealsReducer} from "@/redux/appeals/appealsSlice";
import {auditLogsReducer} from "@/redux/audit-logs/auditLogsSlice";
import adsReducer from "@/redux/ads/adsSlice";
import messagingAvailabilityReducer from "@/redux/messagingAvailability/messagingAvailabilitySlice";
import privateChatReducer from "@/redux/privateChat/privateChatSlice";
import privateChatUiReducer from "@/redux/privateChat/privateChatUiSlice";
import observerChatReducer from "@/redux/observerChat/observerChatSlice";
import observerChatUiReducer from "@/redux/observerChat/observerChatUiSlice";
import {setupListeners} from "@reduxjs/toolkit/query";
// Ads portal RTK Query APIs (merged monolith) — registered into the single store.
import {userApi} from "@ads/store/services/userApi";
import {paymentApi} from "@ads/store/services/paymentApi";
import {adFormatsApi} from "@ads/store/services/adFormatsApi";
import {fileApi} from "@ads/store/services/fileApi";
import {adsApi as adsPortalApi} from "@ads/store/services/adsApi";
import {adminAdsApi} from "@ads/store/services/adminAdsApi";
import {adminUsersApi} from "@ads/store/services/adminUsersApi";

const adsPortalApis = [userApi, paymentApi, adFormatsApi, fileApi, adsPortalApi, adminAdsApi, adminUsersApi];


const settingsPersistConfig = {
    key: 'settings',
    storage,
    whitelist: ['chatRoomSoundSetting', 'mediaPlayerMuted', 'showAppBackground'],
};

const adsPersistConfig = {
    key: 'ads',
    storage,
    whitelist: ['currentAd', 'lastServedTimestamp', 'lastAdFetchTimestamp', 'servedChatroomIds', 'adPlacementsByChatroomId'],
};

const chatRoomPersistConfig = {
    key: 'chatRoom',
    storage,
    whitelist: ['selectedUserChatRoom']
};

const chatRoomUiPersistConfig = {
    key: 'chatRoomUi',
    storage,
    whitelist: ['chatroomOrder']
};

const privateChatPersistConfig = {
    key: 'privateChat',
    storage,
    whitelist: ['selectedChatId']
};

const privateChatUiPersistConfig = {
    key: 'privateChatUi',
    storage,
    whitelist: ['openTabIds', 'tabOrder', 'conversationOrder', 'sidebarVisible']
};

const persistedSettingsReducer = persistReducer(settingsPersistConfig, settingsReducer);
const persistedAdsReducer = persistReducer(adsPersistConfig, adsReducer);
const persistedChatRoomReducer = persistReducer(chatRoomPersistConfig, chatRoomReducer);
const persistedChatRoomUiReducer = persistReducer(chatRoomUiPersistConfig, chatRoomUiReducer);
const persistedPrivateChatReducer = persistReducer(privateChatPersistConfig, privateChatReducer);
const persistedPrivateChatUiReducer = persistReducer(privateChatUiPersistConfig, privateChatUiReducer);

const appReducer = combineReducers({
    user: userReducer,
    auth: authReducer,
    chatRoom: persistedChatRoomReducer,
    chatRoomUi: persistedChatRoomUiReducer,
    settings: persistedSettingsReducer,
    modPanel: modPanelReducer,
    admin: adminReducer,
    reportCases: reportCasesReducer,
    appeals: appealsReducer,
    auditLogs: auditLogsReducer,
    ads: persistedAdsReducer,
    messagingAvailability: messagingAvailabilityReducer,
    privateChat: persistedPrivateChatReducer,
    privateChatUi: persistedPrivateChatUiReducer,
    // Observer (admin review) chat is intentionally NOT persisted — sensitive admin-viewed
    // messages must not survive a reload; the tab refetches fresh each time.
    observerChat: observerChatReducer,
    observerChatUi: observerChatUiReducer,
    // Ads portal RTK Query cache reducers (not persisted)
    [userApi.reducerPath]: userApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [adFormatsApi.reducerPath]: adFormatsApi.reducer,
    [fileApi.reducerPath]: fileApi.reducer,
    [adsPortalApi.reducerPath]: adsPortalApi.reducer,
    [adminAdsApi.reducerPath]: adminAdsApi.reducer,
    [adminUsersApi.reducerPath]: adminUsersApi.reducer,
});

export const resetApp = createAction('app/reset');

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: any) => {
    if (action.type === logoutThunk.pending.type) {
        state = {
            settings: state?.settings
        } as ReturnType<typeof appReducer>;
    }
    if (action.type === deleteAccountThunk.fulfilled.type || action.type === resetApp.type) {
        state = undefined;
    }
    return appReducer(state, action);
};

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            }
        }).concat(adsPortalApis.map((api) => api.middleware)),
});

// Enable RTK Query refetchOnFocus/refetchOnReconnect for the ads portal APIs.
setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
