interface Trend {
    isPositive: boolean;
    value: string;
}

interface Footer {
    title: string;
    description: string;
}

export interface Stat {
    id?: string;
    label: string;
    value: string;
    trend: Trend;
    footer: Footer;
}