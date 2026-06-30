import {Tag} from "@/models/Tag";
import api from "@/lib/api";
import {AttachmentType} from "@/models/AttachmentType";
import {UpdateTimeFormatRequest} from "@/models/UpdateTimeFormatRequest";

const SETTINGS_PATH = "/settings";

export const getAllTags = async (): Promise<Tag[]> => {
    const res = await api.get<Tag[]>(SETTINGS_PATH + "/tags");
    return res.data;
}

export const getAllAttachmentTypes = async () => {
    const res = await api.get<AttachmentType[]>(SETTINGS_PATH + "/attachment-types");
    return res.data;
}

export const updateTimeFormat = async (timeFormatRequest: UpdateTimeFormatRequest): Promise<void> => {
    await api.patch(SETTINGS_PATH + "/time-format", timeFormatRequest);
};