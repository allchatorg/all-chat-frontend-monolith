import {Tabs, TabsList, TabsTrigger} from "@ads/components/ui/tabs";
import Link from "next/link";
import {ReactNode} from "react";
import {TabConfig} from "@ads/models/TabConfig";

interface NavigationTabsProps {
    tabs: TabConfig[];
    activeValue: string;
    className?: string;
    tabsListClassName?: string;
    tabTriggerClassName?: string;
    children?: ReactNode;
}

export function NavigationTabs({
                                   tabs,
                                   activeValue,
                                   className = "flex h-full w-full ",
                                   tabsListClassName = "flex w-full rounded-none border-b border-border h-12 bg-card p-0 flex-shrink-0",
                                   tabTriggerClassName = "rounded-none border-b-2 border-transparent text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground overflow-hidden",
                                   children
                               }: NavigationTabsProps) {

    return (
        <div className="flex h-full w-full flex-col">
            <Tabs value={activeValue} className="w-full">
                <TabsList
                    className={tabsListClassName}
                >
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className={tabTriggerClassName}
                            asChild
                        >
                            <Link
                                href={tab.href}
                                className="flex h-full flex-1 items-center justify-center gap-2"
                            >
                                {tab.icon && <tab.icon className="h-4 w-4"/>}
                                {tab.label}
                            </Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {children && (
                <div className="min-h-0 flex-1 overflow-auto p-4">
                    {children}
                </div>
            )}
        </div>
    );
}
