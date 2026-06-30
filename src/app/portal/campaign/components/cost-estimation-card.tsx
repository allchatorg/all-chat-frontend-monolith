import {Card, CardContent} from "@ads/components/ui/card";
import {Label} from "@ads/components/ui/label";
import {Slider} from "@ads/components/ui/slider";
import {AdFormatDto, AdFormatType} from "@ads/data/adFormats";
import {CampaignDetails} from "@ads/hooks/use-campaign-creator";
import {useMemo} from "react";
import {calculateAdCost} from "@ads/utils/pricing-utils";
import {Info} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@ads/components/ui/tooltip";

interface CostEstimationCardProps {
    details: CampaignDetails;
    setDetails: (value: React.SetStateAction<CampaignDetails>) => void;
    selectedFormat: AdFormatDto;
    adFormats: AdFormatDto[];
}

export default function CostEstimationCard({
                                               details,
                                               setDetails,
                                               selectedFormat,
                                               adFormats
                                           }: CostEstimationCardProps) {

    const pricingData = useMemo(() => {
        return calculateAdCost(selectedFormat, details.text.length, details.views, adFormats);
    }, [details.views, details.text.length, selectedFormat, adFormats]);

    const {totalCost, baseCPM, textCPM, totalCPM} = pricingData;

    // Determine which tiers to show in the tooltip
    const effectiveTiers = useMemo(() => {
        if (selectedFormat.pricingTiers && selectedFormat.pricingTiers.length > 0) {
            return selectedFormat.pricingTiers;
        }
        // Fallback to TEXT format tiers if current format has none (e.g. Photo/Video with text component)
        const textFormat = adFormats.find(f => f.type === AdFormatType.TEXT);
        return textFormat?.pricingTiers || [];
    }, [selectedFormat, adFormats]);

    const showTextPricing = textCPM > 0 || selectedFormat.type === AdFormatType.TEXT;

    return (
        <Card className="border-border shadow-sm h-full">
            <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="space-y-8">
                    {/* Target Views Slider Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold text-foreground">Target Views</Label>
                            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                                {details.views.toLocaleString()}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Slider
                                defaultValue={[details.views]}
                                value={[details.views]}
                                max={30000}
                                min={1000}
                                step={1000}
                                onValueChange={(vals) => setDetails(prev => ({...prev, views: vals[0]}))}
                                className="py-2"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                <span>1k views</span>
                                <span>30k views</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-muted"/>

                    {/* Cost Breakdown */}
                    <div className="space-y-3 text-sm">
                        {/* Show Base CPM if it is non-zero */}
                        {baseCPM > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Base CPM</span>
                                <span className="font-medium text-foreground">${baseCPM.toFixed(2)}</span>
                            </div>
                        )}

                        {/* Show Text Tier Info if applicable */}
                        {showTextPricing && (
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1">
                                    <span
                                        className="text-muted-foreground">Text Component ({details.text.length} chars)</span>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info
                                                className="w-3 h-3 text-muted-foreground hover:text-muted-foreground cursor-help"/>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="text-xs space-y-1">
                                                <p className="font-semibold">Text Pricing Tiers:</p>
                                                {effectiveTiers.map((tier, idx) => (
                                                    <p key={idx}>Up to {tier.maxCharacters} chars:
                                                        ${tier.pricePerMille} CPM</p>
                                                ))}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <span className="font-medium text-foreground">${textCPM.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="mt-2 pt-2 border-t border-border flex justify-between items-center">
                            <span className="text-muted-foreground font-medium">Total CPM</span>
                            <span className="font-medium text-foreground">${totalCPM.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Total Estimate */}
                <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-foreground">Total Estimate</span>
                        <span className="text-3xl font-bold text-blue-600">
                            ${totalCost.toFixed(2)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

