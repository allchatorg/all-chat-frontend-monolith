import {Suspense} from 'react';
import {VipBillingReturn} from '@/features/vip/VipBillingReturn';

export default function VipReturnPage() {
    return <Suspense fallback={<div role="status" className="p-8">Loading your subscription…</div>}><VipBillingReturn/></Suspense>;
}
