import {Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle} from "@ads/components/ui/card";
import {Badge} from "@ads/components/ui/badge";

interface NotifyCardProps {
    title: string;
    value: number;
    label?: string;
    description: string;
    variant?: "default" | "success" | "warning" | "destructive";
}

export function NotifyCard({title, value, label, description, variant = "default"}: NotifyCardProps) {
    const variantColors = {
        default: "text-foreground",
        success: "text-green-600 dark:text-green-400",
        warning: "text-yellow-600 dark:text-yellow-400",
        destructive: "text-red-600 dark:text-red-400"
    };

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle
                    className={`text-5xl font-bold tabular-nums @[250px]/card:text-6xl ${variantColors[variant]}`}>
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
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">{description}</div>
            </CardFooter>
        </Card>
    );
}