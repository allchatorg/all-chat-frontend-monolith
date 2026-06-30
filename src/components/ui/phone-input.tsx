"use client";

import * as React from "react";
import {
    PhoneInput as InternationalPhoneInput,
    type PhoneInputProps,
    type PhoneInputRefType,
} from "react-international-phone";
import "react-international-phone/style.css";

import {cn} from "@/lib/utils";

const PhoneInput = React.forwardRef<PhoneInputRefType, PhoneInputProps>(
    ({className, defaultCountry = "us", inputClassName, ...props}, ref) => {
        return (
            <InternationalPhoneInput
                ref={ref}
                defaultCountry={defaultCountry}
                className={cn("app-phone-input w-full", className)}
                inputClassName={cn(
                    "w-full border border-input bg-background px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground",
                    inputClassName,
                )}
                {...props}
            />
        );
    },
);
PhoneInput.displayName = "PhoneInput";

export {PhoneInput};
