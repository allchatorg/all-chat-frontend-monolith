import api from "@/lib/api";
import {Message} from "@/models/message";

export interface ServeAdRequest {
    userId: number;
    ipAddress?: string;
}

/**
 * Fetches an advertisement from the server
 * @returns MessageResponseDTO or null if no ad available (204)
 */
export const serveAd = async (): Promise<Message | null> => {
    try {
        const response = await api.post<Message>("/ads/serve");

        // If we get a 204 No Content, return null
        if (response.status === 204) {
            return null;
        }

        return response.data;
    } catch (error: any) {
        // Handle 204 No Content as a valid "no ad" response
        if (error.response?.status === 204) {
            return null;
        }
        throw error;
    }
};

/**
 * Records a click-through on a photo/video ad (media overlay opened).
 * Fire-and-forget: failures are swallowed so ad interaction is never blocked.
 */
export const registerAdClick = (adId: number): void => {
    api.post(`/ads/${adId}/click`).catch(() => {
        // Stats tracking must never surface errors to the user
    });
};
