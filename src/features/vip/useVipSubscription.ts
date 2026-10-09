'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {selectUser} from '@/redux/user/userSelectors';
import {setUser} from '@/redux/user/userSlice';
import {store} from '@/redux/store';
import {applyVipBadgeUpdate} from '@/lib/vipBadgeStore';
import {getVipSubscription, vipErrorMessage} from './api';
import {VipAppearance, VipSubscription} from './types';

export function syncVipAppearance(userId: number, appearance: VipAppearance) {
    const currentUser = selectUser(store.getState());
    if (currentUser?.id !== userId) return;
    if ((currentUser.vipBadgeRevision ?? 0) > appearance.vipBadgeRevision) return;
    store.dispatch(setUser({user: {...currentUser, ...appearance}}));
    applyVipBadgeUpdate({userId, ...appearance});
}

export function notifyVipChanged() {
    window.dispatchEvent(new Event('allchat:vip-changed'));
}

export function useVipSubscription(pollForConfirmation = false) {
    const user = useSelector(selectUser);
    const userId = user?.id;
    const role = user?.role;
    const [subscription, setSubscription] = useState<VipSubscription | null>(null);
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
            const result = await getVipSubscription(fromProvider);
            if (version !== requestVersion.current) return;
            setSubscription(result);
            setError(null);
            syncVipAppearance(userId, {
                vipActive: result.vipActive,
                showVipBadge: result.showVipBadge,
                vipBadgeVisible: result.vipBadgeVisible,
                vipBadgeRevision: result.vipBadgeRevision,
            });
        } catch (failure) {
            if (version === requestVersion.current) setError(vipErrorMessage(failure));
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
        window.addEventListener('allchat:vip-changed', onFocus);
        const timer = window.setInterval(onFocus, 60_000);
        return () => {
            requestVersion.current++;
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('allchat:vip-changed', onFocus);
            window.clearInterval(timer);
        };
    }, [refresh, userId, role, pollForConfirmation]);

    useEffect(() => {
        if (!userId || (subscription?.vipActive && !subscription.pendingInterval) || (!pollForConfirmation && !subscription?.checkoutPending && !subscription?.pendingInterval)) return;
        let attempts = 0;
        const timer = window.setInterval(() => {
            void refresh();
            if (++attempts >= 20) window.clearInterval(timer);
        }, 3_000);
        return () => window.clearInterval(timer);
    }, [refresh, userId, pollForConfirmation, subscription?.vipActive, subscription?.checkoutPending, subscription?.pendingInterval]);

    return {subscription, loading, error, refresh};
}
