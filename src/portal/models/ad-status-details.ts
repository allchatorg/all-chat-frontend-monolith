import {AdFormatType, AdStatus} from "./ad";

export interface AdStatusDetails {
    id: number;
    title: string;
    formatType: AdFormatType;
    viewsBought: number;
    price: number;
    submittedDate: string; // ISO string for LocalDateTime
    startDate: string; // ISO string for LocalDateTime
    email: string;
    userId: number;
    status: AdStatus;
    textContent?: string;
    imageUrl?: string;
    videoUrl?: string;
    cardBrand: string;
    cardLast4: string;
    rejectionReason?: string;
}
