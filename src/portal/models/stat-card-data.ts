export interface StatCardData {
    id: number;
    title: string;
    value: string;
    trend: "up" | "down";
    trendValue: string;
    footerText: string;
    description: string;
}