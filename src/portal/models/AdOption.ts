import {AdType} from "@ads/models/adType";

export interface AdOption {
    id: AdType;
    title: string;
    description: string;
    pricePerMille: number;
    icon: React.ElementType;
    recommended?: boolean;
    features: string[];
}
