import {Progress} from "@ads/components/ui/progress";
import {cn} from "@ads/lib/utils";
import {Check} from "lucide-react";


interface ClickableStepperProps {
    steps: string[];
    currentStep: number;
    onStepChange: (step: number) => void;
}

export const ClickableStepper = ({
                                     steps = [],
                                     currentStep = 0,
                                     onStepChange
                                 }: ClickableStepperProps) => {

    // Calculate progress percentage based on current step index
    // e.g. 3 steps: Step 0 = 0%, Step 1 = 50%, Step 2 = 100%
    const progressValue = (currentStep / (steps.length - 1)) * 100;

    return (
        <div className="w-full flex flex-col gap-4 pb-8">
            <div className="relative flex items-center justify-between w-full">

                {/* Background Progress Bar */}
                {/* We use absolute positioning to place it behind the buttons */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full -z-0 px-1">
                    <Progress value={progressValue} className="h-[3px]"/>
                </div>

                {/* Step Buttons */}
                {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <button
                            key={index}
                            onClick={() => onStepChange(index)}
                            className={cn(
                                "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
                                // Colors for Active/Completed state
                                (isActive || isCompleted)
                                    ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:border-slate-50 dark:text-slate-900"
                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                            )}
                        >
                            {/* Show Checkmark if completed, otherwise show number */}
                            <span className="text-sm font-semibold">
                                {isCompleted ? (
                                    <Check className="w-5 h-5"/>
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </span>

                            {/* Optional: Step Label below the circle */}
                            <div className="absolute top-12 min-w-[80px] text-center">
                                <span className={cn(
                                    "whitespace-nowrap text-xs font-medium transition-colors duration-300",
                                    isActive ? "text-slate-900 dark:text-slate-50" : "text-slate-500"
                                )}>
                                    {step}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};