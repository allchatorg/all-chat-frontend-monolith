"use client";

import {Fragment} from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {cn} from "@/lib/utils";

interface AdminBreadcrumbItem {
    label: string;
    href?: string;
    returnToParam?: string;
}

interface AdminBreadcrumbProps {
    items: AdminBreadcrumbItem[];
    className?: string;
}

function getSafeReturnPath(path: string | null) {
    if (!path || !path.startsWith("/") || path.startsWith("//")) {
        return null;
    }

    return path;
}

export function AdminBreadcrumb({items, className}: AdminBreadcrumbProps) {
    const searchParams = useSearchParams();

    return (
        <Breadcrumb className={cn("px-1", className)}>
            <BreadcrumbList className="flex-nowrap overflow-hidden">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const returnTo = item.returnToParam
                        ? getSafeReturnPath(searchParams.get(item.returnToParam))
                        : null;
                    const href = returnTo ?? item.href;

                    return (
                        <Fragment key={`${item.label}-${index}`}>
                            <BreadcrumbItem className={index === 0 ? "shrink-0" : "min-w-0"}>
                                {isLast || !href ? (
                                    <BreadcrumbPage className="block max-w-48 truncate sm:max-w-88">
                                        {item.label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild className="block max-w-48 truncate sm:max-w-88">
                                        <Link href={href}>{item.label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator className="shrink-0"/>}
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
