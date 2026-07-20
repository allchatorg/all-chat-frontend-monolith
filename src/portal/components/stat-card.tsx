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
        <Card className={cn("@container/card", compact && "gap-3 py-4")}>
            <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle
                    className={cn(
                        "font-semibold tabular-nums",
                        compact ? "text-xl @[250px]/card:text-2xl" : "text-2xl @[250px]/card:text-3xl"
                    )}>
                    {value}
                </CardTitle>
                {trendValue && (
                    <CardAction>
                        <Badge variant="outline">
                            <TrendIcon/>
                            {trendValue}
                        </Badge>
                    </CardAction>
                )}
            </CardHeader>
            <CardFooter className={cn("flex-col items-start text-sm", compact ? "gap-0.5" : "gap-1.5")}>
                {!compact && (
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        {footerText} {trendValue && <TrendIcon className="size-4"/>}
                    </div>
                )}
                <div className={cn("text-muted-foreground", compact && "line-clamp-1")}>{description}</div>
            </CardFooter>
        </Card>
    );
}
