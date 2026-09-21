import {Check, Diamond, MessageCircle, Minus, Smile, Sparkles, Sticker} from 'lucide-react';
import Image from 'next/image';
import {ProBadge} from '@/components/ProBadge';
import {cn} from '@/lib/utils';

const benefits = [
    {label: 'Public chat rooms', basic: true},
    {label: 'Media & file sharing', basic: true},
    {label: 'Emoji reactions & replies', basic: true},
    {label: 'Light & dark themes', basic: true},
    {label: '17 exclusive character stickers', basic: false},
    {label: 'Exclusive Pro badge', basic: false},
    {label: 'Show or hide your Pro badge', basic: false},
];

export function ProBenefits({username}: {username: string}) {
    return (
        <section aria-labelledby="pro-benefits-heading">
            <div className="mb-6 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">A place for every conversation</p>
                <h2 id="pro-benefits-heading" className="mt-2 text-2xl font-extrabold tracking-tight">Good conversations come standard.</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Enjoy the essentials with Basic. Add your own little signature with Pro.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <article className="overflow-hidden rounded-2xl border bg-card">
                    <div aria-hidden="true" className="relative flex h-36 items-center justify-center overflow-hidden bg-indigo-50 dark:bg-indigo-950/40">
                        <div className="absolute h-28 w-28 rounded-full bg-indigo-200/50 dark:bg-indigo-500/10"/>
                        <div className="relative -rotate-6 rounded-2xl rounded-bl-sm bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/10">Hey, everyone! <span className="ml-1">✌️</span></div>
                        <div className="relative -ml-6 mt-14 rotate-6 rounded-2xl rounded-br-sm border border-indigo-100 bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-900/10">Hey, you! <MessageCircle className="ml-1 inline h-4 w-4"/></div>
                    </div>
                    <div className="p-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Basic + Pro</p>
                        <h3 className="mt-2 font-bold">Find your people.</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Jump into public chat rooms, share a moment, and find a conversation that feels like home.</p>
                    </div>
                </article>
                <article className="overflow-hidden rounded-2xl border bg-card">
                    <div aria-hidden="true" className="flex h-36 items-center justify-center gap-3 overflow-hidden bg-amber-50 dark:bg-amber-950/20">
                        <div className="-rotate-12 rounded-2xl border border-amber-200/70 bg-white p-3 text-3xl shadow-lg shadow-amber-900/5">👋</div>
                        <div className="-translate-y-2 rounded-2xl bg-amber-400 p-4 text-amber-950 shadow-lg shadow-amber-900/10"><Smile className="h-10 w-10 stroke-[1.5]"/></div>
                        <div className="rotate-12 rounded-2xl border border-amber-200/70 bg-white p-3 text-3xl shadow-lg shadow-amber-900/5">💜</div>
                    </div>
                    <div className="p-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Basic + Pro</p>
                        <h3 className="mt-2 font-bold">Say it your way.</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Share media, react with emoji, and make yourself at home with light and dark themes.</p>
                    </div>
                </article>
                <article className="overflow-hidden rounded-2xl border border-violet-200 bg-card dark:border-violet-500/30">
                    <div aria-hidden="true" className="relative flex h-36 items-center justify-center overflow-hidden bg-violet-100/70 px-6 dark:bg-violet-950/40">
                        <Sparkles className="absolute left-8 top-5 h-5 w-5 text-violet-400"/>
                        <Sparkles className="absolute bottom-5 right-8 h-4 w-4 text-fuchsia-400"/>
                        <div className="flex min-w-0 -rotate-3 items-center gap-2 rounded-2xl border border-violet-200 bg-white p-4 text-slate-900 shadow-lg shadow-violet-900/10">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-600"><MessageCircle className="h-5 w-5"/></span>
                            <span className="max-w-28 truncate text-sm font-bold">{username}</span>
                            <ProBadge className="dark:text-violet-700"/>
                        </div>
                    </div>
                    <div className="p-5">
                        <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300"><Diamond className="h-3 w-3"/>Pro exclusive</p>
                        <h3 className="mt-2 font-bold">Small badge. Big personality.</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">A purple Pro badge next to your name in chats, replies, and messages. Show or hide it anytime in Appearance.</p>
                    </div>
                </article>
                <article className="overflow-hidden rounded-2xl border border-violet-200 bg-card dark:border-violet-500/30">
                    <div aria-hidden="true" className="flex h-36 items-center justify-center overflow-hidden bg-fuchsia-50 px-4 dark:bg-fuchsia-950/20">
                        <div className="flex -rotate-6 items-center rounded-2xl border border-fuchsia-200/60 bg-white/70 p-2 shadow-lg shadow-fuchsia-900/5 dark:bg-violet-950/50">
                            <Image src="/stickers/pro/pepe.png" alt="" width={82} height={90} unoptimized className="h-[90px] w-[82px] object-contain"/>
                            <Image src="/stickers/pro/wojak.png" alt="" width={82} height={90} unoptimized className="h-[90px] w-[82px] object-contain"/>
                            <Image src="/stickers/pro/gondola.png" alt="" width={82} height={90} unoptimized className="h-[90px] w-[82px] object-contain"/>
                        </div>
                    </div>
                    <div className="p-5">
                        <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300"><Sticker className="h-3 w-3"/>Pro exclusive</p>
                        <h3 className="mt-2 font-bold">A sticker for the moment.</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Unlock 17 internet classics, from Wojak and Pepe to Gondola. Send them in rooms and private chats, with or without a caption.</p>
                    </div>
                </article>
            </div>
        </section>
    );
}

export function ProComparison({yearly}: {yearly: boolean}) {
    return (
        <div className="overflow-hidden rounded-2xl border">
            <table className="w-full table-fixed border-collapse text-sm">
                <caption className="sr-only">allchat Basic and Pro plan benefits and pricing</caption>
                <thead>
                    <tr className="border-b">
                        <th scope="col" className="w-[46%] p-3 text-left align-bottom text-xs font-medium text-muted-foreground sm:p-5">What&apos;s included</th>
                        <th scope="col" className="p-3 text-center sm:p-5"><span className="block text-base font-extrabold">Basic</span><span className="mt-2 block text-xs font-normal text-muted-foreground">Free</span></th>
                        <th scope="col" className="border-x border-violet-300 bg-violet-50 p-3 text-center dark:border-violet-500/40 dark:bg-violet-500/10 sm:p-5"><span className="mb-2 block text-[9px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">A little extra</span><span className="flex items-center justify-center gap-1 text-base font-extrabold"><Diamond className="h-4 w-4 text-violet-500"/>Pro</span><span className="mt-2 block text-xs font-normal text-muted-foreground">{yearly ? '$50 / year' : '$5 / month'}</span></th>
                    </tr>
                </thead>
                <tbody>
                    {benefits.map(benefit => (
                        <tr key={benefit.label} className="border-b last:border-b-0">
                            <th scope="row" className="px-3 py-4 text-left text-xs font-medium leading-5 sm:px-5 sm:text-sm">{benefit.label}</th>
                            <td className="p-3 text-center">{benefit.basic ? <><Check aria-hidden="true" className="mx-auto h-4 w-4 text-muted-foreground"/><span className="sr-only">Included</span></> : <><Minus aria-hidden="true" className="mx-auto h-4 w-4 text-muted-foreground/50"/><span className="sr-only">Not included</span></>}</td>
                            <td className={cn('border-x border-violet-300 bg-violet-50 p-3 text-center dark:border-violet-500/40 dark:bg-violet-500/10', !benefit.basic && 'text-violet-600 dark:text-violet-300')}><Check aria-hidden="true" className="mx-auto h-4 w-4"/><span className="sr-only">Included</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
