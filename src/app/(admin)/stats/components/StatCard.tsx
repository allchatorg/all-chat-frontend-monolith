import {LucideIcon} from "lucide-react";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
}

export function StatCard({title, value, description, icon: Icon}: StatCardProps) {
    return (
        <Card>
            <CardHeader className="space-y-2 p-4 sm:p-5">
                <CardDescription className="flex items-center justify-between gap-2">
                    {title}
                    <Icon className="h-4 w-4 shrink-0"/>
                </CardDescription>
                <CardTitle className="text-2xl tabular-nums sm:text-3xl">{value}</CardTitle>
                <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
            </CardHeader>
        </Card>
    );
}
