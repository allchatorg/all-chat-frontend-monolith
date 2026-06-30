import {RootState} from "@/redux/store";

export const selectSettings = (state: RootState) => state.settings;
export const selectAttachmentTypesState = (state: RootState) => state.settings.attachmentTypesState;
export const selectActiveRightPanel = (state: RootState) => state.settings.activeRightPanel;
export const selectActiveLeftPanel = (state: RootState) => state.settings.activeLeftPanel;


