'use client';
import {SiteHeader} from "@ads/components/site-header"
import AdCampaignSelector from "@/app/portal/campaign/components/ad-campaign-selector";
import {ClickableStepper} from "@ads/components/clickable-stepper";
import {useCampaignCreator} from "@ads/hooks/use-campaign-creator";
import CampaignConfiguration from "@/app/portal/campaign/components/campaign-configuration";
import StripePayment from "@/app/portal/campaign/components/stripe-payment";
import {Suspense} from "react";

function CampaignContent() {
    const {
        currentStep,
        nextStep,
        selectedAdFormat,
        setSelectedAdFormat,
        details,
        setDetails,
        errors,
        adFormats,
        prevStep,
        isLoading
    } = useCampaignCreator();

    const STEPS = ['Select Type', 'Configure', 'Payment'];

    if (isLoading || !selectedAdFormat) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <p className="text-muted-foreground text-lg">Loading options...</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center mx-auto max-w-5xl space-y-6 px-6 py-8 md:px-12 md:py-10">

            {/* Pass hook logic to Stepper */}
            <ClickableStepper
                steps={STEPS}
                currentStep={currentStep}
                onStepChange={() => {
                }}
            />

            {/* Step 0: Ad Type Selection */}
            <div className="w-full">
                {currentStep === 0 && (
                    <AdCampaignSelector
                        adFormats={adFormats}
                        selectedFormat={selectedAdFormat}
                        onSelect={setSelectedAdFormat}
                        onNext={nextStep}
                    />
                )}

                {/* Step 1: Configuration */}
                {currentStep === 1 && (
                    <CampaignConfiguration
                        selectedFormat={selectedAdFormat}
                        details={details}
                        setDetails={setDetails}
                        errors={errors}
                        adFormats={adFormats}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                )}

                {/* Step 2: Payment */}
                {currentStep === 2 && (
                    <div className="w-full max-w-md mx-auto">
                        <StripePayment
                            details={details}
                            selectedFormat={selectedAdFormat}
                            adFormats={adFormats}
                            onBack={prevStep}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <div className="w-full">
            <SiteHeader
                title="Ad Campaign"
                description="Choose your campaign type and start advertising on allchat"
            />

            <Suspense fallback={
                <div className="w-full h-64 flex items-center justify-center">
                    <p className="text-muted-foreground text-lg">Loading options...</p>
                </div>
            }>
                <CampaignContent/>
            </Suspense>
        </div>
    );
}