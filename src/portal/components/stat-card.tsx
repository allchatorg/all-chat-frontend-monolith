import {IconTrendingDown, IconTrendingUp} from "@tabler/icons-react";
import {Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle} from "@ads/components/ui/card";
import {Badge} from "@ads/components/ui/badge";

interface StatCardProps {
    title: string;
    value: string;
    trend: "up" | "down";
    trendValue: string;
    footerText: string;
    description: string;
}

export function StatCard({title, value, trend, trendValue, footerText, description}: StatCardProps) {
    const TrendIcon = trend === "up" ? IconTrendingUp : IconTrendingDown;

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {value}
                </CardTitle>
                <CardAction>
                    <Badge variant="outline">
                        <TrendIcon/>
                        {trendValue}
                    </Badge>
                </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    {footerText} <TrendIcon className="size-4"/>
                </div>
                <div className="text-muted-foreground">{description}</div>
            </CardFooter>
        </Card>
    );
}
