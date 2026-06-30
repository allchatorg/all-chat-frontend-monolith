import api from "@/lib/api";
import {Attachment} from "@/models/Attachment";
import {CreateMessageRequest} from "@/models/CreateMessageRequest";
import {Message} from "@/models/message";
import {EditMessageRequest} from "@/models/EditMessageRequest";
import {RemoveMessageAttachment} from "@/models/RemoveMessageAttachment";
import {MessagingAvailability} from "@/models/MessagingAvailability";

const CHATTING_PATH = "/chatting";

export const getMessagingAvailability = async (): Promise<MessagingAvailability> => {
    const res = await api.get<MessagingAvailability>(CHATTING_PATH + "/messaging-availability");
    return res.data;
};

export const saveAndBroadcastMessage = async (message: CreateMessageRequest): Promise<Message> => {
    const res = await api.post(CHATTING_PATH + "/messages", message);
    return res.data;
};

export const uploadAttachment = async (file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("attachment", file);

    const res = await api.post<Attachment>(CHATTING_PATH + "/attachments", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data;
};

export const deleteAttachment = async (attachmentId: number): Promise<void> => {
    await api.delete(CHATTING_PATH + `/attachments/${attachmentId}`);
};

export const deleteMessage = async (messageId: number): Promise<void> => {
    await api.delete(CHATTING_PATH + `/messages/${messageId}`);
};

export const editMessage = async (messageId: number, editMessageRequest: EditMessageRequest): Promise<Message> => {
    const res = await api.patch(CHATTING_PATH + `/messages/${messageId}/edit`, editMessageRequest);
    return res.data;
}

export const removeAttachmentFromMessage = async (messageId: number, removeAttachmentRequest: RemoveMessageAttachment): Promise<Message> => {
    const res = await api.patch(CHATTING_PATH + `/messages/${messageId}/remove-attachment`, removeAttachmentRequest)
    return res.data;
}

export const getMessageHistory = async (messageId: number): Promise<Message[]> => {
    const res = await api.get<Message[]>(CHATTING_PATH + `/messages/${messageId}/history`);
    return res.data;
}
