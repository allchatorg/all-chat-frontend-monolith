import {createAsyncThunk} from '@reduxjs/toolkit';
import {serveAd} from '@/api/ads/adsAPI';
import {Message} from '@/models/message';

export const fetchAd = createAsyncThunk<Message | null>(
    'ads/fetchAd',
    async () => {
        return await serveAd();
    }
);
