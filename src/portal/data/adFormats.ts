export enum AdFormatType {
    TEXT = "TEXT",
    PHOTO = "PHOTO",
    VIDEO = "VIDEO"
}

export interface TextPricingTierRule {
    maxCharacters: number;
    pricePerMille: number;
}

export interface AdFormatDto {
    id: number;
    type: AdFormatType;
    title: string;
    description: string;
    pricePerMille: number;
    recommended: boolean;
    features: string[];
    pricingTiers: TextPricingTierRule[];
}


