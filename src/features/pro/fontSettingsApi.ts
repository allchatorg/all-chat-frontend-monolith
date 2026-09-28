import {isAxiosError} from 'axios';
import api from '@/lib/api';
import type {FontPreset, FontSnapshot} from '@/lib/fontPresets';

export interface FontSettings extends FontSnapshot {
    proActive: boolean;
    dailyLimit: number;
    changesRemaining: number;
    resetsAt: string;
}

export const getFontSettings = async () =>
    (await api.get<FontSettings>('/settings/fonts')).data;

export const updateFontSettings = async (usernameFont: FontPreset, messageFont: FontPreset) =>
    (await api.patch<FontSettings>('/settings/fonts', {usernameFont, messageFont})).data;

export function fontSettingsErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        if (error.response?.status === 403) return 'An active allchat Pro subscription is required to save fonts.';
        if (error.response?.status === 429) return 'You have used all your font changes today. Try again after midnight UTC.';
        const message = error.response?.data?.message || error.response?.data?.detail;
        if (typeof message === 'string') return message;
    }
    return 'We could not update your font preferences. Please try again.';
}
