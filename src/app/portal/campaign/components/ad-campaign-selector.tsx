'use client'
'use client'
import {useState} from "react";
import {CheckCircle2, ChevronLeft, ChevronRight, MousePointerClick} from "lucide-react";
import {AdCard} from "@/app/portal/campaign/components/ad-card";
import {AdFormatDto} from "@ads/data/adFormats";


interface AdCampaignSelectorProps {
    selectedFormat: AdFormatDto;
    onSelect: (format: AdFormatDto) => void;
    onNext: () => void;
    adFormats: AdFormatDto[];
}

export default function AdCampaignSelector({
                                               selectedFormat,
                                               onSelect,
                                               onNext,
                                               adFormats
                                           }: AdCampaignSelectorProps) {

    // We keep carousel index local as it's purely UI/View state
    const [currentMobileIndex, setCurrentMobileIndex] = useState(1);

    // Mobile Carousel Logic
    const nextSlide = () => {
        setCurrentMobileIndex((prev) => (prev === adFormats.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentMobileIndex((prev) => (prev === 0 ? adFormats.length - 1 : prev - 1));
    };

    return (
        <div className="flex flex-col items-center justify-center font-sans">
            <div>
                {/* Header Section */}
                <div className="text-center space-y-4 mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                        Choose your Ad Format
                    </h1>
                    <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                        Select the format that best suits your campaign goals.
                        Pricing is based on impressions (CPM).
                    </p>
                </div>

                {/* --- DESKTOP VIEW (Grid) --- */}
                <div className="hidden md:grid md:grid-cols-3 gap-6">
                    {adFormats.map((format) => (
                        <div key={format.id} className="h-full">
                            <AdCard
                                format={format}
                                isSelected={selectedFormat.id === format.id}
                                onSelect={onSelect}
                            />
                        </div>
                    ))}
                </div>

                {/* --- MOBILE VIEW (Carousel) --- */}
                <div className="md:hidden relative w-full max-w-md mx-auto">
                    {/* Carousel Container */}
                    <div className="relative h-[480px] w-full perspective-1000">
                        {adFormats.map((format, index) => {
                            if (index !== currentMobileIndex) return null;
                            return (
                                <div key={format.id} className="animate-in fade-in zoom-in duration-300 h-full">
                                    <AdCard
                                        format={format}
                                        isSelected={selectedFormat.id === format.id}
                                        onSelect={onSelect}
                                        className="shadow-xl"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Carousel Controls */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-4 z-10">
                        <button
                            onClick={prevSlide}
                            className="p-2 rounded-full bg-card border border-border shadow-md text-muted-foreground hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                            aria-label="Previous Ad Type"
                        >
                            <ChevronLeft size={24}/>
                        </button>
                    </div>

                    <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-10">
                        <button
                            onClick={nextSlide}
                            className="p-2 rounded-full bg-card border border-border shadow-md text-muted-foreground hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                            aria-label="Next Ad Type"
                        >
                            <ChevronRight size={24}/>
                        </button>
                    </div>

                    {/* Carousel Indicators */}
                    <div className="flex justify-center mt-6 gap-2">
                        {adFormats.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentMobileIndex(idx)}
                                className={`
                                    h-2 rounded-full transition-all duration-300
                                    ${idx === currentMobileIndex ? 'w-8 bg-indigo-600' : 'w-2 bg-muted'}
                                `}
                            />
                        ))}
                    </div>

                    <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                        <MousePointerClick size={12}/>
                        Tap card to select
                    </p>
                </div>

                {/* Footer / Continue Section */}
                <div
                    className="mt-12 bg-card rounded-xl p-6 border border-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-500/15 p-2 rounded-lg">
                            <CheckCircle2 className="text-indigo-600 dark:text-indigo-400 w-5 h-5"/>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Selected Format</p>
                            <p className="text-lg font-bold text-foreground capitalize">
                                {selectedFormat.title}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onNext} // Trigger the Hook's nextStep function
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md shadow-indigo-200 dark:shadow-indigo-900/50">
                        Continue to Configuration
                    </button>
                </div>
            </div>
        </div>
    );
}