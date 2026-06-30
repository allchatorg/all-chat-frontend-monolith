import {BanTypeEnum} from "@/models/BanTypeEnum";
import {ReportType} from "@/models/ReportTypeEnum";

export interface BanRequest {
    userId: string;
    duration?: number;
    reportType: ReportType;
    banType: BanTypeEnum;
    description?: string;
    deleteMessages: boolean;
    deleteMessagesDuration?: number;
    reportCaseId?: number;
}
