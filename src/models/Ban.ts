import {BanTypeEnum} from "@/models/BanTypeEnum";
import {ReportType} from "@/models/ReportTypeEnum";

export interface Ban {
    id: number;
    userId: number;
    username: string;
    ipAddress: string;
    userAgent: string;
    description: string;
    expiresAt: string;
    active: boolean;
    type: BanTypeEnum;
    reportType: ReportType
}
