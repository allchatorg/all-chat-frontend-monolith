import {Ban} from "@/models/Ban";
import {BanTypeEnum} from "@/models/BanTypeEnum";
import {CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {AlertTriangle, Clock, Globe, Shield, User} from "lucide-react";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Separator} from "@/components/ui/separator";
import {Badge} from "@/components/ui/badge";
import {getReportTypeLabel, isCsamReportType} from "@/lib/reportUtils";

interface BanDetailsProps {
    ban: Ban;
}

export const BanDetailsCard: React.FC<BanDetailsProps> = ({ban}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getReportTypeColor = () => {
        return isCsamReportType(ban.reportType)
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    };

    const isExpired = new Date(ban.expiresAt) < new Date();
    const isPermanent = ban.type === BanTypeEnum.PERMANENT;

    return (
        <div className="w-[80vw] md:min-w-[800px] md:max-w-[800px] h-[500px] overflow-auto mx-auto max-w-2xl sm:p-4">
            <CardHeader className="px-0 sm:px-6">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl">
                    <div className="flex items-center">
                        <Shield className="h-5 w-5"/>
                        Ban Information #{ban.id}
                    </div>
                    <div className="flex items-center gap-2 sm:ml-auto">
                        <Badge variant={ban.active ? "destructive" : "secondary"}>
                            {ban.active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={isPermanent ? "destructive" : "default"}>
                            {ban.type}
                        </Badge>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-0 sm:px-6">
                {ban.active && !isExpired && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertDescription className="text-sm">
                            This ban is currently active and being enforced.
                        </AlertDescription>
                    </Alert>
                )}

                {isExpired && ban.type === BanTypeEnum.TEMPORARY && (
                    <Alert>
                        <Clock className="h-4 w-4"/>
                        <AlertDescription className="text-sm">
                            This temporary ban has expired.
                        </AlertDescription>
                    </Alert>
                )}

                <div>
                    <h3 className="mb-2 font-semibold">Report Type</h3>
                    <Badge className={getReportTypeColor()}>
                        {getReportTypeLabel(ban.reportType)}
                    </Badge>
                </div>

                {ban.description && (
                    <div>
                        <h3 className="mb-2 font-semibold">Description</h3>
                        <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600 wrap-break-word dark:bg-zinc-900 dark:text-zinc-400">
                            {ban.description}
                        </p>
                    </div>
                )}

                <Separator/>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                        <h3 className="flex items-center gap-2 font-semibold">
                            <User className="h-4 w-4"/>
                            User Details
                        </h3>
                        <div className="text-sm space-y-2">
                            <div className="flex flex-col sm:block">
                                <span className="font-medium">Username:</span>
                                <span
                                    className="sm:ml-2 mt-1 sm:mt-0 inline-block rounded bg-gray-100 px-2 py-1 font-mono break-all dark:bg-zinc-800 dark:text-zinc-200">
                                    {ban.username}
                                </span>
                            </div>
                            <div className="flex flex-col sm:block">
                                <span className="font-medium">User ID:</span>
                                <span
                                    className="sm:ml-2 mt-1 sm:mt-0 inline-block font-mono text-gray-600 break-all dark:text-zinc-400">
                                    {ban.userId}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="flex items-center gap-2 font-semibold">
                            <Globe className="h-4 w-4"/>
                            Technical Info
                        </h3>
                        <div className="text-sm space-y-2">
                            <div className="flex flex-col sm:block">
                                <span className="font-medium">IP Address:</span>
                                <span
                                    className="sm:ml-2 mt-1 sm:mt-0 inline-block rounded bg-gray-100 px-2 py-1 font-mono break-all dark:bg-zinc-800 dark:text-zinc-200">
                                    {ban.ipAddress}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium">User Agent:</span>
                                <p className="mt-1 break-all text-xs text-gray-600 dark:text-zinc-400">
                                    {ban.userAgent}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator/>

                <div>
                    <h3 className="mb-3 flex items-center gap-2 font-semibold">
                        <Clock className="h-4 w-4"/>
                        Duration & Expiry
                    </h3>
                    <div className="rounded-md bg-gray-50 p-3 dark:bg-zinc-900">
                        <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="font-medium">Type:</span>
                                <span
                                    className={isPermanent ? "text-red-600 font-semibold dark:text-red-400" : "text-blue-600 dark:text-blue-400"}>
                                    {isPermanent ? "Permanent Ban" : "Temporary Ban"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Expires At:</span>
                                <span
                                    className={isExpired ? "text-gray-500 dark:text-zinc-500" : "text-orange-600 dark:text-orange-400"}>
                                    {isPermanent ? "Never" : formatDate(ban.expiresAt)}
                                </span>
                            </div>
                            {!isPermanent && (
                                <div className="flex justify-between">
                                    <span className="font-medium">Status:</span>
                                    <span
                                        className={isExpired ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                        {isExpired ? "Expired" : "Active"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </div>
    );
};
