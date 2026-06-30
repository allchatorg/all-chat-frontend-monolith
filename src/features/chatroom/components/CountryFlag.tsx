import React from 'react';
import ReactCountryFlag from "react-country-flag";
import {getCountryName} from "@/lib/utils/countryUtils";
import {cn} from "@/lib/utils";

interface CountryFlagProps {
    countryCode?: string | null;
    className?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({countryCode, className}) => {
    if (!countryCode) return null;

    const countryName = getCountryName(countryCode);

    return (
        <div
            className={cn(
                "inline-flex items-center justify-center overflow-hidden border border-black leading-[0] dark:border-white",
                className
            )}
            title={countryName}
        >
            <ReactCountryFlag
                countryCode={countryCode}
                svg
                aria-label={countryName}
                style={{
                    display: "block",
                    width: "1.333em",
                    height: "1em",
                    verticalAlign: "unset",
                }}
            />
        </div>
    );
};
