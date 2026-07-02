'use client';

import React from 'react';
import {useConnection} from '@/lib/hooks/useConnection';
import {WifiOff} from 'lucide-react';

export const SplashOffline = () => {
    const {isOnline} = useConnection();

    if (isOnline) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-primary-blue-bg transition-opacity duration-300 p-6">
            <div
                className="flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-500 max-w-md w-full">
                <div className="flex items-center justify-center p-6 bg-muted/30 dark:bg-muted/10 rounded-full">
                    <WifiOff className="w-12 h-12 md:w-14 md:h-14 animate-pulse text-destructive"/>
                </div>

                <div className="space-y-3 px-4">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        You are offline
                    </h2>
                    <p className="text-muted-foreground text-[15px] md:text-base leading-relaxed">
                        Please check your internet connection. We&apos;ll automatically reconnect you when you&apos;re
                        back online.
                    </p>
                </div>

                <div className="flex items-center justify-center pt-4 gap-2.5">
                    <div
                        className="w-2.5 h-2.5 bg-primary/80 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div
                        className="w-2.5 h-2.5 bg-primary/80 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2.5 h-2.5 bg-primary/80 rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    );
};
