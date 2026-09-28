export type ProBillingReturnState = {
    checkout?: 'success' | 'canceled';
    billingUpdated: boolean;
};

type SearchParams = {get: (key: string) => string | null};

export function getProBillingReturn(searchParams: SearchParams): ProBillingReturnState | null {
    const checkout = searchParams.get('checkout');
    const billingUpdated = searchParams.get('billing') === 'updated';
    if (searchParams.get('pro') !== 'subscriptions' && checkout !== 'success' && checkout !== 'canceled' && !billingUpdated) return null;
    return {checkout: checkout === 'success' || checkout === 'canceled' ? checkout : undefined, billingUpdated};
}

export function proChatReturnUrl(searchParams: SearchParams): string {
    const result = getProBillingReturn(searchParams);
    const params = new URLSearchParams({pro: 'subscriptions'});
    if (result?.checkout) params.set('checkout', result.checkout);
    if (result?.billingUpdated) params.set('billing', 'updated');
    return `/?${params}`;
}
