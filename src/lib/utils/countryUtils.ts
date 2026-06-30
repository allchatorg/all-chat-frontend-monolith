export const getCountryFlag = (countryCode: string | undefined | null): string => {
    if (!countryCode) return '';
    try {
        return countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0))
            .reduce((acc, char) => acc + String.fromCodePoint(char), '');
    } catch (e) {
        console.error("Error generating country flag:", e);
        return '';
    }
};

export const getCountryName = (countryCode: string | undefined | null): string => {
    if (!countryCode) return 'Unknown Country';
    try {
        const regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
        return regionNames.of(countryCode.toUpperCase()) || countryCode;
    } catch (e) {
        console.error("Error getting country name:", e);
        return countryCode || 'Unknown Country';
    }
};
