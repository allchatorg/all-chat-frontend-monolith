import {Card} from "@/components/ui/card";
import React, {ReactNode} from "react";
import {LucideIcon} from "lucide-react";
import {User, UserMinimal} from "@/models/User";

interface AdminPageHeaderProps {
    title: string;
    description?: string;
    icon: LucideIcon;
    user?: User | UserMinimal;
    children?: ReactNode;
}

export function AdminPageHeader({title, description, icon: Icon, user, children}: AdminPageHeaderProps) {
    return (
        <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                    <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold">
                        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-destructive"/>
                        {title}
                    </h1>
                    {(description || user) && (
                        <p className="text-sm sm:text-lg text-muted-foreground hidden sm:block">
                            {description}
                            {description && user && ": "}
                            {user && (
                                <span className="font-semibold text-foreground">
                                    {user.username} (ID: {user.id})
                                </span>
                            )}
                        </p>
                    )}
                </div>
                {children && (
                    <div className="flex items-center gap-2">
                        {children}
                    </div>
                )}
            </div>
        </Card>
    );
}
