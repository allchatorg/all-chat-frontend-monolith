export type VipBillingReturnState = {
    checkout?: 'success' | 'canceled';
    billingUpdated: boolean;
};

type SearchParams = {get: (key: string) => string | null};

export function getVipBillingReturn(searchParams: SearchParams): VipBillingReturnState | null {
    const checkout = searchParams.get('checkout');
    const billingUpdated = searchParams.get('billing') === 'updated';
    if (searchParams.get('vip') !== 'subscriptions' && checkout !== 'success' && checkout !== 'canceled' && !billingUpdated) return null;
    return {checkout: checkout === 'success' || checkout === 'canceled' ? checkout : undefined, billingUpdated};
}

export function vipChatReturnUrl(searchParams: SearchParams): string {
    const result = getVipBillingReturn(searchParams);
    const params = new URLSearchParams({vip: 'subscriptions'});
    if (result?.checkout) params.set('checkout', result.checkout);
    if (result?.billingUpdated) params.set('billing', 'updated');
    return `/?${params}`;
}
