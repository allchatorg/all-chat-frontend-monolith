import React from "react";

interface MessageSkeletonsProps {
    count?: number;
    className?: string;
}

export const MessageSkeletons: React.FC<MessageSkeletonsProps> = ({count = 8, className = ""}) => {
    return (
        <div className={`space-y-4 ${className}`}>
            {[...Array(count)].map((_, index) => (
                <div key={index} className="flex w-full items-start gap-3 py-1 pr-2">
                    {/* Avatar skeleton */}
                    <div className="glass-surface w-8 h-8 rounded-full animate-pulse shrink-0"></div>

                    <div className="flex-1 space-y-2">
                        {/* Username and timestamp skeleton */}
                        <div className="flex items-center gap-2">
                            <div className="glass-surface h-4 w-24 rounded animate-pulse"></div>
                            <div className="glass-surface h-3 w-16 rounded animate-pulse"></div>
                        </div>

                        {/* Message content skeleton - varying widths for realism */}
                        <div className="space-y-2">
                            <div
                                className="glass-surface h-4 rounded animate-pulse"
                                style={{width: `${60 + (index * 5) % 40}%`}}
                            ></div>
                            {index % 3 === 0 && (
                                <div
                                    className="glass-surface h-4 rounded animate-pulse"
                                    style={{width: `${40 + (index * 7) % 30}%`}}
                                ></div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
