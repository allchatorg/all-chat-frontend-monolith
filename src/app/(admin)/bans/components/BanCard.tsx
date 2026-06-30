import {Ban} from "@/models/Ban";
import {Card} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import React from "react";
import {useDialog} from "@/components/providers/DialogProvider";
import {BanDetailsCard} from "@/app/(admin)/bans/components/BanDetailsCard";
import {getReportTypeLabel, isCsamReportType} from "@/lib/reportUtils";

interface BanCardProps {
    ban: Ban;
    revokeBan: (userId: number) => void;
}

export const BanCard: React.FC<BanCardProps> = ({ban, revokeBan}) => {
    const {open} = useDialog();

    return (
        <Card className="p-3 transition-shadow hover:shadow-md">
            <div className="flex flex-col gap-2 sm:grid sm:grid-cols-8 sm:items-center sm:gap-4">
                <div className="flex flex-row justify-between sm:col-span-1 sm:block sm:min-w-0">
                    <div className="truncate font-semibold">{ban.username}</div>
                    <div className="truncate text-sm text-muted-foreground">{ban.userId}</div>
                </div>
                <div className="flex gap-2 sm:contents">
                    <div className="sm:col-span-1">
                        <Badge variant="secondary" className="capitalize">
                            {getReportTypeLabel(ban.reportType)}
                        </Badge>
                    </div>
                    <div className="sm:col-span-1">
                        <Badge variant="destructive" className="uppercase">
                            {ban.type}
                        </Badge>
                    </div>
                </div>
                <div className="min-w-0 truncate text-sm text-muted-foreground sm:col-span-1">
                    {ban.description}
                </div>
                <div className="flex justify-end gap-2 sm:col-span-4">
                    <Button
                        onClick={() =>
                            open(<BanDetailsCard ban={ban}/>)
                        }
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                    >
                        Details
                    </Button>
                    {!isCsamReportType(ban.reportType) && (
                        <Button
                            onClick={() => {
                                revokeBan(ban.userId)
                            }}
                            variant="destructive"
                            size="sm"
                            className="flex-1 sm:flex-none"
                        >
                            Revoke
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};
