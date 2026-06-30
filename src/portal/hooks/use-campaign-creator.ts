import {useEffect, useMemo, useState} from "react";
import {AdFormatDto, AdFormatType} from "@ads/data/adFormats";
import {useSearchParams} from "next/navigation";
import {useGetAdFormatsQuery} from "@ads/store/services/adFormatsApi";

export interface CampaignDetails {
    name: string;
    text: string;
    media: File | null;
    mediaUrl: string | null;
    views: number;
}

export interface ValidationErrors {
    name?: string;
    text?: string;
    media?: string;
}

export function useCampaignCreator() {
    const searchParams = useSearchParams();
    const initialFormatId = searchParams.get('formatId');

    // 1. Stepper State
    const [currentStep, setCurrentStep] = useState(0);

    // 2. Data State
    const {data: apiAdFormats, isLoading} = useGetAdFormatsQuery();
    const adFormats = useMemo(() => apiAdFormats || [], [apiAdFormats]);

    // Default to URL param -> PHOTO -> First Option
    const [selectedAdFormat, setSelectedAdFormat] = useState<AdFormatDto | null>(null);

    useEffect(() => {
        if (isLoading || !adFormats || adFormats.length === 0) return;

        // If we already have a selection that matches current data, do nothing?
        // Or if we want to respect URL param on first load:
        if (selectedAdFormat === null) {
            let found: AdFormatDto | undefined;
            if (initialFormatId) {
                found = adFormats.find(f => f.id === Number(initialFormatId));
            }
            if (!found) {
                found = adFormats.find(f => f.type === AdFormatType.PHOTO) || adFormats[0];
            }
            if (found) {
                setSelectedAdFormat(found);
            }
        }
    }, [adFormats, initialFormatId, isLoading, selectedAdFormat]);

    const [details, setDetails] = useState<CampaignDetails>({
        name: '',
        text: '',
        media: null,
        mediaUrl: null,
        views: 1000
    });
    const [errors, setErrors] = useState<ValidationErrors>({});

    // --- Logic Actions ---

    const goToStep = (step: number) => {
        setCurrentStep(step);
    };

    const validateConfiguration = (): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        if (!details.name.trim()) {
            newErrors.name = 'Campaign name is required';
            isValid = false;
        }

        if (!selectedAdFormat) return false;

        // Only require text if it is a text ad
        if (selectedAdFormat.type === AdFormatType.TEXT && !details.text.trim()) {
            newErrors.text = 'Ad text content is required';
            isValid = false;
        }

        // Only require media if NOT a text ad
        // You might want to refine this if you have other types in future
        if (selectedAdFormat.type !== AdFormatType.TEXT && !details.media && !details.mediaUrl) {
            newErrors.media = 'Media (photo or video) is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const nextStep = () => {
        if (currentStep === 1) {
            if (validateConfiguration()) {
                setCurrentStep((prev) => prev + 1);
            }
        } else {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => (prev > 0 ? prev - 1 : 0));
    };

    // Select Ad Type logic
    const selectAdFormat = (format: AdFormatDto) => {
        // Only perform updates if the type is actually different (by ID or Type)
        if (!selectedAdFormat || format.id !== selectedAdFormat.id) {
            setSelectedAdFormat(format);
            // Reset details but keep default views
            setDetails(prev => ({
                ...prev,
                name: '',
                text: '',
                media: null,
                mediaUrl: null
            }));
            setErrors({});
        }
    };

    return {
        // State
        currentStep,
        selectedAdFormat,
        details,
        errors,
        adFormats,
        isLoading,

        // Actions
        goToStep,
        nextStep,
        prevStep,
        setSelectedAdFormat: selectAdFormat,
        setDetails,
        setErrors
    };
}