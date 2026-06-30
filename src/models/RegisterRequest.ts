export interface RegisterRequest {
    username: string;
    email: string;
    phoneNumber?: string;
    password: string;
    isOver18: boolean;
    isOverDigitalConsent: boolean;
    acceptsTermsAndPrivacy: boolean;
    captchaToken?: string;
}