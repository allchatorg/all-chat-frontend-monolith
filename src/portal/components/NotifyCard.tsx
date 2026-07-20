import {Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle} from "@ads/components/ui/card";
import {Badge} from "@ads/components/ui/badge";
import {cn} from "@ads/lib/utils";

interface NotifyCardProps {
    title: string;
    value: number;
    label?: string;
    description: string;
    variant?: "default" | "success" | "warning" | "destructive";
    compact?: boolean;
}

export function NotifyCard({title, value, label, description, variant = "default", compact}: NotifyCardProps) {
    const variantColors = {
        default: "text-foreground",
        success: "text-green-600 dark:text-green-400",
        warning: "text-yellow-600 dark:text-yellow-400",
        destructive: "text-red-600 dark:text-red-400"
    };

    return (
        <Card className={cn("@container/card", compact && "gap-2 py-3")}>
            <CardHeader
                className={cn(compact && "@max-[250px]/card:flex @max-[250px]/card:flex-row @max-[250px]/card:items-center @max-[250px]/card:justify-between @max-[250px]/card:gap-x-2")}>
                <CardDescription className={cn(compact && "@max-[250px]/card:flex-1")}>{title}</CardDescription>
                <CardTitle
                    className={cn(
                        "font-bold tabular-nums",
                        compact
                            ? "text-xl @[250px]/card:text-4xl @max-[250px]/card:shrink-0"
                            : "text-5xl @[250px]/card:text-6xl",
                        variantColors[variant]
                    )}>
                    {value}
                </CardTitle>
                {label && (
                    <CardAction className={cn(compact && "@max-[250px]/card:hidden")}>
                        <Badge variant="outline">
                            {label}
                        </Badge>
                    </CardAction>
                )}
            </CardHeader>
            <CardFooter
                className={cn(
                    "flex-col items-start text-sm",
                    compact ? "gap-0.5 @max-[250px]/card:hidden" : "gap-1.5"
                )}>
                <div className={cn("text-muted-foreground", compact && "hidden @[250px]/card:block")}>
                    {description}
                </div>
            </CardFooter>
        </Card>
    );
}
