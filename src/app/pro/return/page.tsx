import {Suspense} from 'react';
import {ProBillingReturn} from '@/features/pro/ProBillingReturn';

export default function ProReturnPage() {
    return <Suspense fallback={<div role="status" className="p-8">Loading your subscription…</div>}><ProBillingReturn/></Suspense>;
}
