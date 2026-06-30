import {ReportType} from "@/models/ReportTypeEnum";
import {Report} from "@/models/Report";

export const reportTypeLabels: Record<ReportType, string> = {
    [ReportType.SPAMMING_ADVERTISING_BEGGING]: "Spamming / Advertising / Begging",
    [ReportType.POSTING_NSFW_CONTENT_AS_SFW]: "Posting NSFW content as SFW",
    [ReportType.IMPERSONATING_A_MODERATOR]: "Impersonating a moderator",
    [ReportType.PIRATED_CONTENT_TORRENTS]: "Pirated Content / Torrents",
    [ReportType.CRIMINAL_INSTRUCTIONS]: "Criminal Instructions",
    [ReportType.DOXXING_HARASSMENT_STALKING]: "Doxxing / Harassment / Stalking",
    [ReportType.NON_CONSENSUAL_SEXUAL_IMAGES]: "Non-consensual Sexual Images",
    [ReportType.INCITEMENT_TO_LAWLESS_ACTION]: "Incitement to Lawless Action",
    [ReportType.TRUE_THREAT]: "True Threat",
    [ReportType.ATTEMPTING_TO_TRIGGER_EPILEPSY]: "Attempting to trigger epilepsy",
    [ReportType.POSTING_IN_A_ROOM_DEDICATED_TO_CRIMINAL_ACTIVITY]: "Posting in a room dedicated to criminal activity",
    [ReportType.UNDERAGE]: "Underage",
    [ReportType.ILLEGAL_CONTENT]: "Illegal Content",
    [ReportType.REAL_CHILD_SEXUAL_ABUSE_MATERIAL]: "Real Child Sexual Abuse Material",
    [ReportType.FICTIONAL_CHILD_SEXUAL_ABUSE_MATERIAL]: "Fictional Child Sexual Abuse Material",
    [ReportType.OTHER_REAL_OBSCENE_PORNOGRAPHY]: "Other Real Obscene Pornography",
    [ReportType.OTHER_FICTIONAL_OBSCENE_PORNOGRAPHY]: "Other Fictional Obscene Pornography",
    [ReportType.SNUFF_CRUSH_MATERIAL]: "Snuff/Crush Material",
    [ReportType.INAPPROPRIATE_COMMUNICATION_WITH_MINOR]: "Inappropriate Communication with Minor",
    [ReportType.KNOWINGLY_SOLICITING_IDENTIFYING_INFO_OR_SEXUAL_CONTENT_FROM_MINOR]: "Knowingly Soliciting Identifying Info or Sexual Content from Minor",
    [ReportType.KNOWINGLY_SENDING_SEXUAL_MESSAGES_OR_CONTENT_TO_MINOR]: "Knowingly Sending Sexual Messages or Content to Minor",
    [ReportType.POSTING_ONION_LINK]: "Posting an Onion Link"
};

export function getReportTypeLabel(reportType: ReportType | string): string {
    return reportTypeLabels[reportType as ReportType] ?? reportType.replace(/_/g, " ");
}

/**
 * Report types that fall under the CSAM (Child Sexual Abuse Material) group.
 */
const CSAM_REPORT_TYPES: ReadonlySet<ReportType> = new Set([
    ReportType.REAL_CHILD_SEXUAL_ABUSE_MATERIAL,
    ReportType.FICTIONAL_CHILD_SEXUAL_ABUSE_MATERIAL,
    ReportType.INAPPROPRIATE_COMMUNICATION_WITH_MINOR,
    ReportType.KNOWINGLY_SOLICITING_IDENTIFYING_INFO_OR_SEXUAL_CONTENT_FROM_MINOR,
    ReportType.KNOWINGLY_SENDING_SEXUAL_MESSAGES_OR_CONTENT_TO_MINOR,
]);

/**
 * Check if a single report type belongs to the CSAM group.
 */
export function isCsamReportType(reportType: ReportType): boolean {
    return CSAM_REPORT_TYPES.has(reportType);
}

/**
 * Check if a report case contains any CSAM-related reports.
 * Returns true if at least one report in the array has a CSAM report type.
 */
export function isCsamReportCase(reports: Report[]): boolean {
    return reports.some((report) => isCsamReportType(report.reportType));
}
