import {IconTrendingDown, IconTrendingUp} from "@tabler/icons-react";
import {Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle} from "@ads/components/ui/card";
import {Badge} from "@ads/components/ui/badge";
import {cn} from "@ads/lib/utils";

interface StatCardProps {
    title: string;
    value: string;
    trend: "up" | "down";
    trendValue: string;
    footerText: string;
    description: string;
    compact?: boolean;
}

export function StatCard({title, value, trend, trendValue, footerText, description, compact}: StatCardProps) {
    const TrendIcon = trend === "up" ? IconTrendingUp : IconTrendingDown;

    return (
        <Card className={cn("@container/card", compact && "gap-2 py-3")}>
            <CardHeader
                className={cn(compact && "@max-[250px]/card:flex @max-[250px]/card:flex-row @max-[250px]/card:items-center @max-[250px]/card:justify-between @max-[250px]/card:gap-x-2")}>
                <CardDescription className={cn(compact && "@max-[250px]/card:flex-1")}>{title}</CardDescription>
                <CardTitle
                    className={cn(
                        "font-semibold tabular-nums",
                        compact
                            ? "text-base @[250px]/card:text-2xl @max-[250px]/card:shrink-0"
                            : "text-2xl @[250px]/card:text-3xl"
                    )}>
                    {value}
                </CardTitle>
                {trendValue && (
                    <CardAction className={cn(compact && "@max-[250px]/card:hidden")}>
                        <Badge variant="outline">
                            <TrendIcon/>
                            {trendValue}
                        </Badge>
                    </CardAction>
                )}
            </CardHeader>
            <CardFooter
                className={cn(
                    "flex-col items-start text-sm",
                    compact ? "gap-0.5 @max-[250px]/card:hidden" : "gap-1.5"
                )}>
                {!compact && (
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {footerText} {trendValue && <TrendIcon className="size-4"/>}
                    </div>
                )}
                <div
                    className={cn(
                        "text-muted-foreground",
                        compact && "hidden @[250px]/card:line-clamp-1"
                    )}>
                    {description}
                </div>
            </CardFooter>
        </Card>
    );
}
