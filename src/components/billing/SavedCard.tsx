'use client';

import {useId, useState} from 'react';
import {IconBrandMastercard, IconBrandVisa, IconCreditCard, IconLock} from '@tabler/icons-react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import type {SavedPaymentCard} from './types';

export function SavedCard({card, className, busy, onRemove, onMakeDefault}: {
    card: SavedPaymentCard; className?: string; busy?: boolean;
    onRemove?: (id: string) => Promise<unknown> | void;
    onMakeDefault?: (id: string) => Promise<unknown> | void;
}) {
    const [confirmRemove, setConfirmRemove] = useState(false);
    const removalReasonId = useId();
    const brand = card.brand.toLowerCase();
    return <div className={cn('space-y-3', className)}>
        <div className="relative flex aspect-[1.586/1] w-full max-w-sm flex-col justify-between rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 text-white shadow-lg">
            <div className="flex items-start justify-between"><div><IconCreditCard className="h-6 w-6 text-white/60"/>{card.isDefault && <span className="mt-2 inline-block rounded bg-white/15 px-2 py-0.5 text-xs">Default for Pro</span>}</div>{brand === 'visa' ? <IconBrandVisa className="h-12 w-12"/> : brand === 'mastercard' ? <IconBrandMastercard className="h-12 w-12"/> : <span className="font-bold uppercase">{card.brand}</span>}</div>
            <div><p className="font-mono text-xl tracking-widest">•••• •••• •••• {card.last4}</p><div className="mt-5 flex items-end justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wide text-white/60">Card holder</p><p className="text-sm">{card.cardholderName || 'Cardholder'}</p></div><div className="text-right"><p className="text-[10px] uppercase tracking-wide text-white/60">Expires</p><p className="font-mono text-sm">{String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}</p></div></div></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">{onMakeDefault && !card.isDefault && <Button variant="outline" disabled={busy} onClick={() => void onMakeDefault(card.id)}>Use for Pro</Button>}{onRemove && <Button variant="destructive-outline" className="disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-600 disabled:opacity-100 dark:disabled:border-slate-600 dark:disabled:bg-slate-800 dark:disabled:text-slate-300" disabled={busy || !card.canRemove} aria-describedby={!card.canRemove ? removalReasonId : undefined} onClick={() => setConfirmRemove(true)}>{!card.canRemove && <IconLock aria-hidden="true"/>}Remove</Button>}</div>
        {onRemove && !card.canRemove && <p id={removalReasonId} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">{card.removalReason || 'This card cannot be removed while it is required for billing.'}</p>}
        {confirmRemove && <div role="alert" className="space-y-2 rounded-lg border p-3 text-sm"><p>Remove the card ending in {card.last4}?</p><div className="flex flex-wrap gap-2"><Button variant="destructive" className="bg-red-600 text-white hover:bg-red-700" disabled={busy} onClick={async () => {await onRemove?.(card.id); setConfirmRemove(false);}}>Remove card</Button><Button variant="outline" disabled={busy} onClick={() => setConfirmRemove(false)}>Keep card</Button></div></div>}
    </div>;
}
