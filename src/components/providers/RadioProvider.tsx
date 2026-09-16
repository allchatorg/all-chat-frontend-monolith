"use client";

import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';
import {useTheme} from 'next-themes';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '@/redux/store';
import {selectUser} from '@/redux/user/userSelectors';
import {setRadioMuted, setRadioStationMode, setRadioVolume} from '@/redux/settings/settingsSlice';
import {getRadioNowPlaying, getRadioStations} from '@/features/radio/api';
import {RadioAudioController} from '@/features/radio/RadioAudioController';
import {
    AzuraCastStation, normalizeRadioVolume, RADIO_STATIONS, RadioNowPlaying,
    RadioStationDefinition, RadioStationKey, RadioStationMode, RadioStatus,
} from '@/features/radio/types';

interface RadioContextValue {
    stationMode: RadioStationMode;
    setStationMode: (mode: RadioStationMode) => void;
    station: RadioStationDefinition;
    nowPlaying: RadioNowPlaying | null;
    status: RadioStatus;
    error: string | null;
    metadataError: string | null;
    volume: number;
    setVolume: (volume: number) => void;
    muted: boolean;
    setMuted: (muted: boolean) => void;
    play: () => void;
    pause: () => void;
    retry: () => void;
    canPlay: boolean;
    isListening: boolean;
    enabled: boolean;
    setMediaSuspended: (suspended: boolean) => void;
}

interface RadioSnapshot {
    key: RadioStationKey;
    station: AzuraCastStation | null;
    data: RadioNowPlaying | null;
    loading: boolean;
    error: string | null;
}

const RadioContext = createContext<RadioContextValue | null>(null);

export function useRadio(): RadioContextValue {
    const context = useContext(RadioContext);
    if (!context) throw new Error('useRadio must be used within RadioProvider');
    return context;
}

export function RadioProvider({children}: {children: React.ReactNode}) {
    const dispatch = useDispatch();
    const pathname = usePathname();
    const {resolvedTheme} = useTheme();
    const user = useSelector(selectUser);
    const savedMode = useSelector((state: RootState) => state.settings.radioStationMode);
    const savedVolume = useSelector((state: RootState) => state.settings.radioVolume);
    const muted = useSelector((state: RootState) => state.settings.radioMuted) === true;
    const stationMode: RadioStationMode = savedMode === 'daybreak' || savedMode === 'nightwave' ? savedMode : 'theme';
    const volume = normalizeRadioVolume(savedVolume);
    const stationKey = stationMode === 'theme' ? (resolvedTheme === 'dark' ? 'nightwave' : 'daybreak') : stationMode;
    const station = RADIO_STATIONS[stationKey];
    const userId = user?.id;
    const enabled = userId != null && !!resolvedTheme && (pathname === '/' || pathname === '/private');

    const [snapshot, setSnapshot] = useState<RadioSnapshot | null>(null);
    const [refreshVersion, setRefreshVersion] = useState(0);
    const [playbackStatus, setPlaybackStatus] = useState<RadioStatus>('paused');
    const [playbackError, setPlaybackError] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [mediaSuspended, setSuspendedState] = useState(false);
    const controller = useRef<RadioAudioController | null>(null);
    const listeningRef = useRef(false);
    const suspendedRef = useRef(false);
    const recoveryRequested = useRef(false);
    const current = snapshot?.key === stationKey ? snapshot : null;
    const nowPlaying = current?.data ?? null;
    const resolvedStation = current?.station ?? null;
    const runtime = useRef({enabled, resolvedStation, nowPlaying, volume, muted});
    runtime.current = {enabled, resolvedStation, nowPlaying, volume, muted};

    const setListening = useCallback((value: boolean) => {
        listeningRef.current = value;
        setIsListening(value);
    }, []);

    const startCurrentStation = useCallback(() => {
        const current = runtime.current;
        if (!current.enabled || !current.resolvedStation || !current.nowPlaying?.is_online || suspendedRef.current) return;
        if (!controller.current) {
            controller.current = new RadioAudioController((status, error) => {
                setPlaybackStatus(status);
                setPlaybackError(error);
                if (status === 'error') setListening(false);
            });
        }
        controller.current.play(current.resolvedStation.listen_url, current.volume, current.muted);
    }, [setListening]);

    const pause = useCallback(() => {
        recoveryRequested.current = false;
        setListening(false);
        controller.current?.release();
        setPlaybackError(null);
        setPlaybackStatus('paused');
    }, [setListening]);

    const play = useCallback(() => {
        const current = runtime.current;
        if (!current.enabled || !current.resolvedStation || !current.nowPlaying?.is_online) return;
        setListening(true);
        setPlaybackError(null);
        if (suspendedRef.current) setPlaybackStatus('suspended');
        else startCurrentStation();
    }, [setListening, startCurrentStation]);

    // Stable across renders: changing media must not run an effect cleanup that
    // briefly resumes radio beneath another audio/video overlay.
    const setMediaSuspended = useCallback((suspended: boolean) => {
        if (suspendedRef.current === suspended) return;
        suspendedRef.current = suspended;
        setSuspendedState(suspended);
        if (!listeningRef.current) return;
        if (suspended) {
            controller.current?.release();
            setPlaybackStatus('suspended');
        } else {
            startCurrentStation();
        }
    }, [startCurrentStation]);

    useEffect(() => {
        // Any identity or allowed-route transition cancels automatic resumption.
        // Switching between public and private chat leaves `enabled` unchanged.
        pause();
    }, [enabled, userId, pause]);

    useEffect(() => {
        recoveryRequested.current = false;
        controller.current?.release();
        setPlaybackError(null);
        setPlaybackStatus(listeningRef.current ? 'buffering' : 'paused');
    }, [stationKey]);

    useEffect(() => {
        controller.current?.setVolume(volume, muted);
    }, [volume, muted]);

    useEffect(() => () => {
        listeningRef.current = false;
        controller.current?.dispose();
        controller.current = null;
    }, []);

    useEffect(() => {
        if (!enabled) return;
        const abort = new AbortController();
        let discovered: AzuraCastStation | null = null;
        let busy = false;
        setSnapshot(previous => previous?.key === stationKey
            ? {...previous, loading: !previous.data, error: null}
            : {key: stationKey, station: null, data: null, loading: true, error: null});

        const refresh = async (discover = false) => {
            if (busy || document.visibilityState === 'hidden' || abort.signal.aborted) return;
            busy = true;
            try {
                if (discover || !discovered) {
                    const stations = await getRadioStations(abort.signal);
                    discovered = stations.find(item => item.shortcode === RADIO_STATIONS[stationKey].shortcode) ?? null;
                }
                if (!discovered) {
                    if (!abort.signal.aborted) setSnapshot({key: stationKey, station: null, data: null, loading: false, error: null});
                    return;
                }
                const data = await getRadioNowPlaying(discovered.id, abort.signal);
                if (!abort.signal.aborted) setSnapshot({key: stationKey, station: discovered, data, loading: false, error: null});
            } catch {
                if (abort.signal.aborted) return;
                setSnapshot(previous => ({
                    key: stationKey,
                    station: discovered ?? (previous?.key === stationKey ? previous.station : null),
                    data: previous?.key === stationKey ? previous.data : null,
                    loading: false,
                    error: 'Radio information is temporarily unavailable. Try again.',
                }));
            } finally {
                busy = false;
            }
        };

        const onReturn = () => {
            if (document.visibilityState === 'hidden') return;
            // A station may have gone offline while this tab was suspended.
            // Revalidate before resuming; keep a healthy stream playing meanwhile.
            recoveryRequested.current = listeningRef.current;
            void refresh(true);
        };
        void refresh(true);
        const interval = window.setInterval(() => void refresh(), 15000);
        document.addEventListener('visibilitychange', onReturn);
        window.addEventListener('focus', onReturn);
        window.addEventListener('online', onReturn);
        return () => {
            abort.abort();
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', onReturn);
            window.removeEventListener('focus', onReturn);
            window.removeEventListener('online', onReturn);
        };
    }, [enabled, stationKey, refreshVersion, startCurrentStation]);

    useEffect(() => {
        if (!enabled || !current || current.loading || current.error) return;
        if (!resolvedStation || nowPlaying?.is_online === false) {
            // AzuraCast serves placeholder audio while offline. Never start it,
            // or restart without a new Play gesture when the station returns.
            pause();
        } else if (listeningRef.current && !suspendedRef.current
            && (recoveryRequested.current || controller.current?.sourceUrl !== resolvedStation.listen_url)) {
            recoveryRequested.current = false;
            startCurrentStation();
        }
    }, [enabled, current, resolvedStation, nowPlaying, pause, startCurrentStation]);

    const setStationMode = useCallback((mode: RadioStationMode) => {
        dispatch(setRadioStationMode(mode));
    }, [dispatch]);
    const setVolume = useCallback((value: number) => {
        dispatch(setRadioVolume(value));
    }, [dispatch]);
    const setMuted = useCallback((value: boolean) => {
        dispatch(setRadioMuted(value));
    }, [dispatch]);
    const retry = useCallback(() => {
        setPlaybackError(null);
        setRefreshVersion(version => version + 1);
        // Retrying an available stream keeps the browser's current user gesture.
        play();
    }, [play]);

    let status: RadioStatus = playbackStatus;
    if (!enabled) status = 'idle';
    else if (!current || current.loading) status = isListening ? 'buffering' : 'loading';
    else if (current.error && !nowPlaying) status = 'error';
    else if (!resolvedStation) status = 'unavailable';
    else if (nowPlaying?.is_online === false) status = 'offline';
    else if (mediaSuspended && isListening) status = 'suspended';

    return (
        <RadioContext.Provider value={{
            stationMode, setStationMode, station, nowPlaying, status,
            error: playbackError ?? (nowPlaying ? null : current?.error ?? null),
            metadataError: current?.error ?? null,
            volume, setVolume, muted, setMuted, play, pause, retry,
            canPlay: enabled && !!resolvedStation && nowPlaying?.is_online === true,
            isListening, enabled, setMediaSuspended,
        }}>
            {children}
        </RadioContext.Provider>
    );
}
