import {Card} from "@ads/components/ui/card";
import * as React from "react";
import clsx from "clsx";
import {Minus, TrendingDown, TrendingUp} from "lucide-react";

interface TotalViewsCardProps {
    title?: string;
    currentValue: number;
    previousValue?: number;
    comparisonText?: string;
    className?: string;
}

export function TotalViewsCard({
                                   title = "Total Views",
                                   currentValue,
                                   previousValue,
                                   comparisonText = "from yesterday",
                                   className,
                               }: TotalViewsCardProps) {
    const hasComparison = previousValue !== undefined && previousValue !== 0;
    const changePercent = hasComparison
        ? ((currentValue - previousValue!) / previousValue!) * 100
        : null;
    const changeText = changePercent !== null ? `${changePercent.toFixed(1)}%` : null;

    const isPositive = changePercent !== null && changePercent > 0;
    const isNegative = changePercent !== null && changePercent < 0;

    return (
        <Card
            className={clsx(
                "flex flex-col justify-between items-center p-4 border-none shadow-none bg-muted/80",
                className
            )}
        >
            <div className="text-sm font-medium text-muted-foreground">{title}</div>
            <div className="text-4xl font-bold tracking-tighter mt-2">{currentValue.toLocaleString()}</div>
            {hasComparison ? (
                <div className={clsx(
                    "flex items-center gap-1 text-xs mt-1",
                    isPositive && "text-green-600 dark:text-green-400",
                    isNegative && "text-red-600 dark:text-red-400",
                    !isPositive && !isNegative && "text-muted-foreground"
                )}>
                    {isPositive && <TrendingUp className="h-3 w-3"/>}
                    {isNegative && <TrendingDown className="h-3 w-3"/>}
                    {!isPositive && !isNegative && <Minus className="h-3 w-3"/>}
                    <span>{changeText} {comparisonText}</span>
                </div>
            ) : (
                <div className="flex items-center gap-1 text-xs text-muted-foreground/60 mt-1">
                    <Minus className="h-3 w-3"/>
                    <span>No comparison data</span>
                </div>
            )}
        </Card>
    );
}
