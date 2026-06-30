export enum NcmecIncidentType {
    CHILD_PORNOGRAPHY = "CHILD_PORNOGRAPHY",
    CHILD_SEX_TRAFFICKING = "CHILD_SEX_TRAFFICKING",
    CHILD_SEX_TOURISM = "CHILD_SEX_TOURISM",
    CHILD_SEXUAL_MOLESTATION = "CHILD_SEXUAL_MOLESTATION",
    MISLEADING_DOMAIN = "MISLEADING_DOMAIN",
    MISLEADING_WORDS = "MISLEADING_WORDS",
    ONLINE_ENTICEMENT = "ONLINE_ENTICEMENT",
    UNSOLICITED_OBSCENE = "UNSOLICITED_OBSCENE",
}

export const NcmecIncidentTypeDescriptions: Record<NcmecIncidentType, string> = {
    [NcmecIncidentType.CHILD_PORNOGRAPHY]: "Child Pornography (possession, manufacture, and distribution)",
    [NcmecIncidentType.CHILD_SEX_TRAFFICKING]: "Child Sex Trafficking",
    [NcmecIncidentType.CHILD_SEX_TOURISM]: "Child Sex Tourism",
    [NcmecIncidentType.CHILD_SEXUAL_MOLESTATION]: "Child Sexual Molestation",
    [NcmecIncidentType.MISLEADING_DOMAIN]: "Misleading Domain Name",
    [NcmecIncidentType.MISLEADING_WORDS]: "Misleading Words or Digital Images on the Internet",
    [NcmecIncidentType.ONLINE_ENTICEMENT]: "Online Enticement of Children for Sexual Acts",
    [NcmecIncidentType.UNSOLICITED_OBSCENE]: "Unsolicited Obscene Material Sent to a Child",
};

export enum NcmecReportAnnotation {
    SEXTORTION = "SEXTORTION",
    CSAM_SOLICITATION = "CSAM_SOLICITATION",
    MINOR_TO_MINOR = "MINOR_TO_MINOR",
    SPAM = "SPAM",
    SADISTIC_EXPLOITATION = "SADISTIC_EXPLOITATION",
}

export const NcmecReportAnnotationLabels: Record<NcmecReportAnnotation, string> = {
    [NcmecReportAnnotation.SEXTORTION]: "Sextortion",
    [NcmecReportAnnotation.CSAM_SOLICITATION]: "CSAM Solicitation",
    [NcmecReportAnnotation.MINOR_TO_MINOR]: "Minor-to-Minor Interaction",
    [NcmecReportAnnotation.SPAM]: "Spam",
    [NcmecReportAnnotation.SADISTIC_EXPLOITATION]: "Sadistic Online Exploitation",
};

export enum NcmecFileAnnotation {
    ANIME_DRAWING_VIRTUAL = "ANIME_DRAWING_VIRTUAL",
    POTENTIAL_MEME = "POTENTIAL_MEME",
    VIRAL = "VIRAL",
    POSSIBLE_SELF_PRODUCTION = "POSSIBLE_SELF_PRODUCTION",
    PHYSICAL_HARM = "PHYSICAL_HARM",
    VIOLENCE_GORE = "VIOLENCE_GORE",
    BESTIALITY = "BESTIALITY",
    LIVE_STREAMING = "LIVE_STREAMING",
    INFANT = "INFANT",
    GENERATIVE_AI = "GENERATIVE_AI",
}

export const NcmecFileAnnotationLabels: Record<NcmecFileAnnotation, string> = {
    [NcmecFileAnnotation.ANIME_DRAWING_VIRTUAL]: "Anime / Drawing / Virtual / Hentai",
    [NcmecFileAnnotation.POTENTIAL_MEME]: "Potential Meme",
    [NcmecFileAnnotation.VIRAL]: "Viral",
    [NcmecFileAnnotation.POSSIBLE_SELF_PRODUCTION]: "Possible Self-Production",
    [NcmecFileAnnotation.PHYSICAL_HARM]: "Physical Harm",
    [NcmecFileAnnotation.VIOLENCE_GORE]: "Violence / Gore",
    [NcmecFileAnnotation.BESTIALITY]: "Bestiality",
    [NcmecFileAnnotation.LIVE_STREAMING]: "Live Streaming",
    [NcmecFileAnnotation.INFANT]: "Infant",
    [NcmecFileAnnotation.GENERATIVE_AI]: "Generative AI",
};

export interface NcmecReportRequest {
    reportCaseId: number;
    incidentType: NcmecIncidentType;
    reportAnnotations: NcmecReportAnnotation[];
    fileAnnotations?: NcmecFileAnnotation[];
}
