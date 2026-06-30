'use client';

import React from 'react';
import {usePathname} from 'next/navigation';
import {NavigationTabs} from '@/components/NavigationTabs';
import {TabConfig} from '@/models/TabConfig';
import {Card} from '@/components/ui/card';
import {AdminPageHeader} from "@/components/AdminPageHeader";
import {Flag} from 'lucide-react';
import {useReportCaseFilters} from '@/lib/hooks/useReportCaseFilters';
import {ReportCasesOverview} from "@/app/(admin)/report-cases/components/ReportCasesOverview";

export default function ReportsPage() {
    const pathname = usePathname();
    const {filters} = useReportCaseFilters();

    const tabs: TabConfig[] = [
        {
            value: 'unresolved',
            label: 'Unresolved',
            href: `${pathname}?resolved=false`,
        },
        {
            value: 'resolved',
            label: 'Resolved',
            href: `${pathname}?resolved=true`,
        },
    ];

    const activeTab = filters.resolved ? 'resolved' : 'unresolved';

    return (
        <div className="flex h-full w-full flex-col px-2 sm:px-4 space-y-2 sm:space-y-4">
            <div className="mx-auto w-full space-y-2 sm:space-y-4">
                <AdminPageHeader
                    title="Reports"
                    description="View, manage, and resolve user reports"
                    icon={Flag}
                />
            </div>

            <Card className="flex min-h-0 flex-1 flex-col p-0 overflow-hidden">
                <NavigationTabs tabs={tabs} activeValue={activeTab}>
                    <div className="h-full w-full p-2 sm:p-4 overflow-hidden">
                        <ReportCasesOverview/>
                    </div>
                </NavigationTabs>
            </Card>
        </div>
    );
}
