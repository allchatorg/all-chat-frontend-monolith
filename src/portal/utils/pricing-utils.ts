import {AdFormatDto, AdFormatType} from "@ads/data/adFormats";

export const MAX_CHAR_COUNT = 500;

export function calculateAdCost(format: AdFormatDto, textLength: number, views: number, adFormats: AdFormatDto[]): {
    totalCost: number;
    baseCPM: number;
    textCPM: number;
    totalCPM: number;
} {
    const baseCPM = format.pricePerMille;
    let textCPM = 0;

    // Get pricing tiers. If current format is TEXT, use its tiers.
    // Otherwise, we need to find the definition of the TEXT format to get its tiers.
    let textTiers = format.pricingTiers;

    // If the current format is NOT text, we want to add the text price on top.
    // We assume there is a standard "TEXT" format in the system that defines these tiers.
    if (format.type !== AdFormatType.TEXT) {
        // Find the TEXT format from the passed data to use its tiers
        const textFormat = adFormats.find(f => f.type === AdFormatType.TEXT);
        if (textFormat && textFormat.pricingTiers) {
            textTiers = textFormat.pricingTiers;
        }
    }

    // Logic for Text Tiers (applies if there are tiers and text)
    if (textTiers && textTiers.length > 0 && textLength > 0) {
        const charCount = textLength;
        // Sort tiers by maxCharacters asc to find the first one that fits
        const sortedTiers = [...textTiers].sort((a, b) => a.maxCharacters - b.maxCharacters);
        const matchedTier = sortedTiers.find(tier => charCount <= tier.maxCharacters);

        // If exceeds max tier, use the highest tier (or base? usually highest tier price)
        if (matchedTier) {
            textCPM = matchedTier.pricePerMille;
        } else if (sortedTiers.length > 0) {
            // Exceeds all tiers? Use the last one (highest char count)
            textCPM = sortedTiers[sortedTiers.length - 1].pricePerMille;
        }
    }

    const totalCPM = baseCPM + textCPM;
    const totalCost = (views / 1000) * totalCPM;

    return {
        totalCost,
        baseCPM,
        textCPM,
        totalCPM
    };
}

export interface CreateAdRequest {
    title: string;
    adType: AdFormatType;
    text: string;
    imageUrl?: string;
    videoUrl?: string;
    stripeId: string;
    viewsBought: number;
    calculatedPrice: number;
    stripeAid: string;
}

export function createAdRequest(data: CreateAdRequest): CreateAdRequest {
    return data;
}
