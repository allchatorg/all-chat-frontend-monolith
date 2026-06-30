export interface UnclaimedRegister {
    username: string;
    isOver18: boolean;
    isOverDigitalConsent: boolean;
    acceptsTermsAndPrivacy: boolean;
    captchaToken?: string;
}