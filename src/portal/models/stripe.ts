export interface StripeCard {
    id: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    country: string;
    funding: string;
}
