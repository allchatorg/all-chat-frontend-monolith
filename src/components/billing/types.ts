export interface SavedPaymentCard {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    cardholderName: string | null;
    isDefault: boolean;
    canRemove: boolean;
    removalReason: string | null;
}

export interface CardSetupIntent {id: string; clientSecret: string;}
