import {Tag} from "@/models/Tag";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {getAllTags} from "@/api/settings/settingsAPI";

export const getAllTagsThunk = createAsyncThunk<Tag[]>(
    "settings/getAllTags",
    async (_, {rejectWithValue}) => {
        try {
            return await getAllTags();
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getAllAttachmentTypesThunk = createAsyncThunk(
    "settings/getAllAttachmentTypes",
    async (_, {rejectWithValue}) => {
        try {
            const res = await import("@/api/settings/settingsAPI");
            return await res.getAllAttachmentTypes();
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);