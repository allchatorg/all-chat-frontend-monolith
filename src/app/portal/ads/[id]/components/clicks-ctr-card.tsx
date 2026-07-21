import {Card} from "@ads/components/ui/card";
import * as React from "react";
import clsx from "clsx";
import {MousePointerClick} from "lucide-react";

interface ClicksCtrCardProps {
    title?: string;
    totalClicks: number;
    todaysClicks: number;
    ctr: number; // fraction 0.0-1.0
    className?: string;
}

export function ClicksCtrCard({
                                  title = "Total Clicks",
                                  totalClicks,
                                  todaysClicks,
                                  ctr,
                                  className,
                              }: ClicksCtrCardProps) {
    return (
        <Card
            className={clsx(
                "flex flex-col justify-between items-center p-4 border-none shadow-none bg-muted/80",
                className
            )}
        >
            <div className="text-sm font-medium text-muted-foreground">{title}</div>
            <div className="text-4xl font-bold tracking-tighter mt-2">{totalClicks.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MousePointerClick className="h-3 w-3"/>
                <span>{(ctr * 100).toFixed(2)}% CTR · {todaysClicks.toLocaleString()} today</span>
            </div>
        </Card>
    );
}
