'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {selectUser} from '@/redux/user/userSelectors';
import {setUser} from '@/redux/user/userSlice';
import {store} from '@/redux/store';
import {applyProBadgeUpdate} from '@/lib/proBadgeStore';
import {getProSubscription, proErrorMessage} from './api';
import {ProAppearance, ProSubscription} from './types';

export function syncProAppearance(userId: number, appearance: ProAppearance) {
    const currentUser = selectUser(store.getState());
    if (currentUser?.id !== userId) return;
    if ((currentUser.proBadgeRevision ?? 0) > appearance.proBadgeRevision) return;
    store.dispatch(setUser({user: {...currentUser, ...appearance}}));
    applyProBadgeUpdate({userId, ...appearance});
}

export function notifyProChanged() {
    window.dispatchEvent(new Event('allchat:pro-changed'));
}

export function useProSubscription(pollForConfirmation = false) {
    const userId = useSelector(selectUser)?.id;
    const [subscription, setSubscription] = useState<ProSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const requestVersion = useRef(0);

    const refresh = useCallback(async (fromProvider = false) => {
        if (!userId) {
            setLoading(false);
            return;
        }
        const version = ++requestVersion.current;
        try {
            const result = await getProSubscription(fromProvider);
            if (version !== requestVersion.current) return;
            setSubscription(result);
            setError(null);
            syncProAppearance(userId, {
                proActive: result.proActive,
                showProBadge: result.showProBadge,
                proBadgeVisible: result.proBadgeVisible,
                proBadgeRevision: result.proBadgeRevision,
            });
        } catch (failure) {
            if (version === requestVersion.current) setError(proErrorMessage(failure));
        } finally {
            if (version === requestVersion.current) setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        setSubscription(null);
        setLoading(Boolean(userId));
        void refresh(pollForConfirmation);
        const onFocus = () => void refresh(true);
        window.addEventListener('focus', onFocus);
        window.addEventListener('allchat:pro-changed', onFocus);
        const timer = window.setInterval(onFocus, 60_000);
        return () => {
            requestVersion.current++;
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('allchat:pro-changed', onFocus);
            window.clearInterval(timer);
        };
    }, [refresh, userId, pollForConfirmation]);

    useEffect(() => {
        if (!userId || subscription?.proActive || (!pollForConfirmation && !subscription?.checkoutPending)) return;
        let attempts = 0;
        const timer = window.setInterval(() => {
            void refresh();
            if (++attempts >= 20) window.clearInterval(timer);
        }, 3_000);
        return () => window.clearInterval(timer);
    }, [refresh, userId, pollForConfirmation, subscription?.proActive, subscription?.checkoutPending]);

    return {subscription, loading, error, refresh};
}
