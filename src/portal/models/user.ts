export interface User {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
    totalPurchasedAds: number;
    subscribedToMarketingEmails: boolean;
    totalSpent: number;
    createdAt: string;
}
