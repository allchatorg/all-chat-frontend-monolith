import React, {useEffect, useRef, useState} from "react";
import {Play} from "lucide-react";

interface RufflePlayerProps {
    swfUrl: string;
    linkText?: string;
}

const RufflePlayer: React.FC<RufflePlayerProps> = ({swfUrl, linkText = "View Flash Content"}) => {
    const [showPlayer, setShowPlayer] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);

    const loadRuffle = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            // Check if Ruffle is already loaded
            if ((window as any).RufflePlayer) {
                resolve();
                return;
            }

            // Check if script is already being loaded
            if (document.querySelector('script[src*="ruffle"]')) {
                const checkInterval = setInterval(() => {
                    if ((window as any).RufflePlayer) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
                return;
            }

            const script = document.createElement("script");
            script.src = "https://unpkg.com/@ruffle-rs/ruffle";
            script.async = true;

            script.onload = () => {
                resolve();
            };

            script.onerror = () => {
                reject(new Error("Failed to load Ruffle player"));
            };

            document.head.appendChild(script);
        });
    };

    const createPlayer = async () => {
        if (!containerRef.current) return;

        try {
            setIsLoading(true);
            setError(null);

            containerRef.current.innerHTML = '';

            await loadRuffle();

            const ruffle = (window as any).RufflePlayer.newest();
            const player = ruffle.createPlayer();

            player.style.width = "100%";
            player.style.height = "100%";

            containerRef.current.appendChild(player);
            playerRef.current = player;

            await player.load(swfUrl);

            setIsLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load Flash content");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (showPlayer) {
            createPlayer();
        }

        // Cleanup
        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy?.();
                } catch (e) {
                    console.warn("Error destroying Ruffle player:", e);
                }
                playerRef.current = null;
            }
        };
    }, [showPlayer, swfUrl]);

    const handleToggle = () => {
        setShowPlayer(!showPlayer);
        if (showPlayer) {
            setError(null);
        }
    };

    return (
        <div className="relative h-full w-full min-h-full">
            {!showPlayer ? (
                <div
                    className="flex h-full w-full items-center justify-center rounded-xl border border-slate-300/50 bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner">
                    <div
                        className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_70%)]"></div>

                    <div className="relative flex flex-col items-center justify-center space-y-4">
                        <button
                            className="flex h-24 w-24 transform items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl transition-all duration-300 group hover:scale-105 hover:from-blue-600 hover:to-blue-700 hover:shadow-2xl active:scale-95"
                            onClick={handleToggle}
                            aria-label="Play Flash content"
                        >
                            <Play
                                className="ml-1 h-10 w-10 text-white transition-transform duration-200 group-hover:scale-110"/>

                            <div
                                className="absolute inset-0 rounded-full bg-blue-400 opacity-20 blur-lg transition-opacity duration-300 group-hover:opacity-30"></div>
                        </button>

                        <div className="text-center">
                            <p className="mb-1 text-lg font-medium text-slate-700">{linkText}</p>
                            <p className="text-sm text-slate-500">Click to load Flash content</p>
                        </div>
                    </div>

                    <div className="absolute top-4 left-4 h-3 w-3 rounded-full bg-blue-400/20"></div>
                    <div className="absolute top-6 right-6 h-2 w-2 rounded-full bg-blue-500/20"></div>
                    <div className="absolute bottom-8 left-8 h-1 w-1 rounded-full bg-blue-300/30"></div>
                    <div className="absolute right-4 bottom-4 h-4 w-4 rounded-full bg-blue-200/20"></div>
                </div>
            ) : (
                <div className="relative h-full w-full overflow-hidden rounded-xl shadow-lg">
                    {isLoading && (
                        <div
                            className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="text-center">
                                <div
                                    className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                                <p className="font-medium text-gray-700">Loading Flash content...</p>
                                <p className="mt-1 text-sm text-gray-500">Please wait a moment</p>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div
                            className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                            <div className="rounded-lg border border-red-200  p-6 text-center shadow-lg">
                                <div
                                    className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                                    </svg>
                                </div>
                                <p className="mb-2 font-semibold text-red-800">Error loading Flash content</p>
                                <p className="mb-4 text-sm text-red-600">{error}</p>
                                <button
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white shadow-md transition-colors duration-200 hover:bg-red-700 hover:shadow-lg"
                                    onClick={createPlayer}
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}
                    <div ref={containerRef} className="h-full w-full min-h-full"/>
                </div>
            )}
        </div>
    );
};

export default RufflePlayer;