'use client';

import {AddCardForm as SharedAddCardForm} from '@/components/billing/AddCardForm';
import {useCompleteCardSetupMutation, useCreateCardSetupMutation} from '@ads/store/services/paymentApi';
import {toast} from 'sonner';

export function AddCardForm({onSuccess, onBusyChange}: {onSuccess?: () => void; onBusyChange?: (busy: boolean) => void}) {
    const [createSetup] = useCreateCardSetupMutation();
    const [completeSetup] = useCompleteCardSetupMutation();
    return <SharedAddCardForm createSetupIntent={() => createSetup().unwrap()} completeSetup={setupIntentId => completeSetup({setupIntentId}).unwrap()} onBusyChange={onBusyChange} onSuccess={() => {toast.success('Payment method added successfully'); onSuccess?.();}}/>;
}
