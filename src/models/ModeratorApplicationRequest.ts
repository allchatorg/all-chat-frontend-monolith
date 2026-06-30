export interface ModeratorApplicationRequest {
    // Section 1: Basic Information
    username: string;
    email: string;
    timeZone: string;
    country: string;

    // Section 2: Availability & Commitment
    hoursPerWeek: string;
    daysAvailable: string[];

    // Section 3: Experience
    hasModeratedBefore: string;
    previousPlatforms?: string;
    whyInterested?: string;

    // Section 4: Judgment & Philosophy
    moderatorRoleDefinition: string;
    freedomBalance: string;
    moreDangerous: string;

    // Section 5: Handling Difficult Content
    comfortableWithDisturbingContent: string;
    unsureClassificationHandling: string;

    // Section 6: Legal & Safety Awareness
    readTosAndGuidelines: string;
    understandNoDownload: string;
    willingToFollowProcedures: string;

    // Section 7: Confidentiality & Conduct
    agreeToKeepConfidential: string;
    agreeNotToUseForPersonal: string;

    // Section 8: Escalation & Authority
    comfortableEnforcingAgainstAgree: string;
    howToRespondToAdminOverrule: string;

    // Section 9: Optional Admin Track
    interestedInAdmin: string;
    whyInterestedInAdmin?: string;

    // Section 10: Colored username
    agreeToColoredName: string;

    // Section 11: Final Acknowledgment
    confirmVolunteer: boolean;
    confirmReview: boolean;
    confirmRemoval: boolean;
    confirmUnpaid: boolean;
    signature: string;
    date: string;
}
