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
        <Card className={cn("@container/card", compact && "gap-3 py-4")}>
            <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle
                    className={cn(
                        "font-bold tabular-nums",
                        compact ? "text-3xl @[250px]/card:text-4xl" : "text-5xl @[250px]/card:text-6xl",
                        variantColors[variant]
                    )}>
                    {value}
                </CardTitle>
                {label && (
                    <CardAction>
                        <Badge variant="outline">
                            {label}
                        </Badge>
                    </CardAction>
                )}
            </CardHeader>
            <CardFooter className={cn("flex-col items-start text-sm", compact ? "gap-0.5" : "gap-1.5")}>
                <div className="text-muted-foreground">{description}</div>
            </CardFooter>
        </Card>
    );
}
