import {Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle} from "@ads/components/ui/card";
import {Badge} from "@ads/components/ui/badge";
import {Progress} from "@ads/components/ui/progress";

interface CompletionCardProps {
    title: string;
    current: number;
    total: number;
    description: string;
    showPercentage?: boolean;
}

export function CompletionCard({title, current, total, description, showPercentage = true}: CompletionCardProps) {
    const percentage = (current && total && Math.round((current / total) * 100)) || 0;
    const isComplete = current >= total;

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {current} / {total}
                </CardTitle>
                {showPercentage && (
                    <CardAction>
                        <Badge variant={isComplete ? "default" : "outline"}>
                            {percentage}%
                        </Badge>
                    </CardAction>
                )}
            </CardHeader>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <Progress value={percentage} className="h-2 w-full"/>
                <div className="text-muted-foreground">{description}</div>
            </CardFooter>
        </Card>
    );
}