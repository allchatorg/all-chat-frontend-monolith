import type {ReactNode} from 'react';
import Image from 'next/image';
import {PRO_REACTIONS} from '@/features/stickers/catalog';
import {fontPresetStyle} from '@/lib/fontPresets';
import {Check, CloudUpload, Diamond, MessageCircle, Minus, Smile, Sparkles, Type} from 'lucide-react';
import {ProBadge} from '@/components/ProBadge';
import {ACCOUNT_LIMITS} from '@/lib/accountLimits';

const megabytes = (bytes: number) => `${bytes / (1024 * 1024)} MB`;
const characters = (count: number) => count.toLocaleString('en-US');

const benefits: {label: string; basic: ReactNode; pro: ReactNode}[] = [
    {
        label: 'Joined chatrooms',
        basic: <span className="space-y-2"><span className="block">{ACCOUNT_LIMITS.guestRooms} for guests</span><span className="block">{ACCOUNT_LIMITS.claimedRooms} for claimed accounts</span><span className="block">{ACCOUNT_LIMITS.verifiedRooms} for email-verified accounts</span></span>,
        pro: `Up to ${ACCOUNT_LIMITS.proRooms}`,
    },
    {label: 'Characters per message', basic: characters(ACCOUNT_LIMITS.regularMessageCharacters), pro: characters(ACCOUNT_LIMITS.proMessageCharacters)},
    {label: 'Per file', basic: megabytes(ACCOUNT_LIMITS.regularFileBytes), pro: megabytes(ACCOUNT_LIMITS.proFileBytes)},
    {label: 'Total uploads in any 1-hour window', basic: megabytes(ACCOUNT_LIMITS.regularHourlyUploadBytes), pro: megabytes(ACCOUNT_LIMITS.proHourlyUploadBytes)},
    {label: 'Media & file sharing', basic: true, pro: true},
    {label: 'Emoji reactions & replies', basic: true, pro: true},
    {label: 'Light & dark themes', basic: true, pro: true},
    {label: 'PRO-only chatrooms', basic: 'Read and report', pro: 'Create and participate'},
    {label: 'Exclusive Pro badge', basic: false, pro: true},
    {label: 'Show or hide your Pro badge', basic: false, pro: true},
    {label: 'Username & message font presets', basic: false, pro: `${ACCOUNT_LIMITS.proDailyFontSaves} saves per day`},
    {label: 'Exclusive stickers, custom emojis & reactions', basic: false, pro: `${PRO_REACTIONS.length} characters`},
];

function ComparisonValue({value}: {value: ReactNode}) {
    if (typeof value !== 'boolean') return <>{value}</>;
    return value
        ? <><Check aria-hidden="true" className="mx-auto h-4 w-4"/><span className="sr-only">Included</span></>
        : <><Minus aria-hidden="true" className="mx-auto h-4 w-4 opacity-50"/><span className="sr-only">Not included</span></>;
}

export function ProBenefits({username}: {username: string}) {
    return (
        <section aria-labelledby="pro-benefits-heading">
            <div className="mb-6 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">More space for every conversation</p>
                <h2 id="pro-benefits-heading" className="mt-2 text-2xl font-extrabold tracking-tight">Share more with allchat Pro.</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Basic includes public chatrooms, media sharing, reactions, and themes. Pro adds higher limits, custom fonts, exclusive stickers and emojis, and your own badge.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <article className="overflow-hidden rounded-2xl border bg-card">
                    <div aria-hidden="true" className="relative flex h-36 items-center justify-center overflow-hidden bg-blue-50 dark:bg-blue-950/40">
                        <div className="absolute h-28 w-28 rounded-full bg-blue-200/50 dark:bg-blue-500/10"/>
                        <div className="relative -rotate-6 rounded-2xl rounded-bl-sm bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10">Hey, everyone! <span className="ml-1">✌️</span></div>
                        <div className="relative -ml-6 mt-14 rotate-6 rounded-2xl rounded-br-sm border border-blue-100 bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-900/10">Hey, you! <MessageCircle className="ml-1 inline h-4 w-4"/></div>
                    </div>
                    <div className="p-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">More chatrooms</p>
                        <h3 className="mt-2 font-bold">Find more of your people.</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Join up to {ACCOUNT_LIMITS.proRooms} chatrooms with Pro and keep all your communities close.</p>
                    </div>
                </article>
                <article className="overflow-hidden rounded-2xl border border-blue-200 bg-card dark:border-blue-500/30">
                    <div aria-hidden="true" className="flex h-36 items-center justify-center gap-4 overflow-hidden bg-amber-50 px-5 dark:bg-amber-950/20">
                        <div className="-rotate-6 rounded-2xl bg-amber-400 p-4 text-amber-950 shadow-lg shadow-amber-900/10"><CloudUpload className="h-10 w-10 stroke-[1.5]"/></div>
                        <div className="rotate-3 rounded-2xl border border-amber-200/70 bg-white px-4 py-3 text-amber-950 shadow-lg shadow-amber-900/5"><span className="block text-2xl font-extrabold">{megabytes(ACCOUNT_LIMITS.proFileBytes)}</span><span className="text-xs">per file</span></div>
                    </div>
                    <div className="p-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">Bigger uploads</p>
                        <h3 className="mt-2 font-bold">Share the whole moment.</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Send files up to {megabytes(ACCOUNT_LIMITS.proFileBytes)} each, with {megabytes(ACCOUNT_LIMITS.proHourlyUploadBytes)} of total uploads in any 1-hour window.</p>
                    </div>
                </article>
                <article className="overflow-hidden rounded-2xl border border-blue-200 bg-card dark:border-blue-500/30">
                    <div aria-hidden="true" className="flex h-36 items-center justify-center overflow-hidden bg-sky-50 px-6 dark:bg-sky-950/20">
                        <div className="w-52 -rotate-3 rounded-2xl rounded-bl-sm border border-sky-200/60 bg-white p-4 shadow-lg shadow-sky-900/5">
                            <div className="space-y-2"><div className="h-2 rounded-full bg-blue-200"/><div className="h-2 w-4/5 rounded-full bg-blue-200"/><div className="h-2 w-3/5 rounded-full bg-blue-200"/></div>
                            <p className="mt-4 text-right text-xs font-semibold text-blue-700">{characters(ACCOUNT_LIMITS.proMessageCharacters)} characters</p>
                        </div>
                    </div>
                    <div className="p-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300">Longer messages</p>
                        <h3 className="mt-2 font-bold">Tell the whole story.</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Write up to {characters(ACCOUNT_LIMITS.proMessageCharacters)} characters per message, with more space for stories, ideas, and replies.</p>
                    </div>
                </article>
                <article className="overflow-hidden rounded-2xl border border-blue-200 bg-card dark:border-blue-500/30">
                    <div aria-hidden="true" className="relative flex h-36 items-center justify-center overflow-hidden bg-blue-100/70 px-6 dark:bg-blue-950/40">
                        <Sparkles className="absolute left-8 top-5 h-5 w-5 text-blue-400"/>
                        <Sparkles className="absolute bottom-5 right-8 h-4 w-4 text-sky-400"/>
                        <div className="flex min-w-0 -rotate-3 items-center gap-2 rounded-2xl border border-blue-200 bg-white p-4 text-slate-900 shadow-lg shadow-blue-900/10">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600"><MessageCircle className="h-5 w-5"/></span>
                            <span className="max-w-28 truncate text-sm font-bold">{username}</span>
                            <ProBadge className="dark:text-violet-700"/>
                        </div>
                    </div>
                    <div className="p-5">
                        <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300"><Diamond className="h-3 w-3"/>Pro exclusive</p>
                        <h3 className="mt-2 font-bold">Your badge. Your choice.</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Add a Pro badge beside your name. Show or hide it anytime in Appearance; all your Pro benefits stay active either way.</p>
                    </div>
                </article>
                <article className="overflow-hidden rounded-2xl border border-blue-200 bg-card dark:border-blue-500/30">
                    <div aria-hidden="true" className="flex h-36 items-center justify-center gap-3 overflow-hidden bg-sky-50 px-5 dark:bg-sky-950/20">
                        {PRO_REACTIONS.filter(character => ['pepe', 'wojak', 'gondola'].includes(character.id)).map(character => (
                            <Image key={character.id} src={character.src} alt="" width={76} height={76} unoptimized className="h-16 w-16 object-contain sm:h-20 sm:w-20"/>
                        ))}
                    </div>
                    <div className="p-5">
                        <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300"><Smile className="h-3 w-3"/>Pro exclusive</p>
                        <h3 className="mt-2 font-bold">A familiar face for every feeling.</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Unlock {PRO_REACTIONS.length} exclusive characters. Send them as stickers, add them as custom emojis in your messages, or use them to react.</p>
                    </div>
                </article>
                <article className="overflow-hidden rounded-2xl border border-blue-200 bg-card dark:border-blue-500/30">
                    <div aria-hidden="true" className="flex h-36 items-center justify-center overflow-hidden bg-sky-50 px-5 dark:bg-sky-950/20">
                        <div className="min-w-0 -rotate-3 rounded-2xl border border-sky-200/60 bg-white px-6 py-4 text-slate-900 shadow-lg shadow-sky-900/5">
                            <p className="max-w-48 truncate text-sm font-bold" style={fontPresetStyle('ROBOTO')}>{username}</p>
                            <p className="mt-2 text-2xl" style={fontPresetStyle('CRAFTY_GIRLS')}>Make yourself at home.</p>
                        </div>
                    </div>
                    <div className="p-5">
                        <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-300"><Type className="h-3 w-3"/>Pro exclusive</p>
                        <h3 className="mt-2 font-bold">Make your words your own.</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">Choose classic, playful, or handwritten fonts for your username and messages in Appearance. Save your choices up to {ACCOUNT_LIMITS.proDailyFontSaves} times per day; the allowance resets at midnight UTC.</p>
                    </div>
                </article>
            </div>
        </section>
    );
}

export function ProComparison({yearly}: {yearly: boolean}) {
    return (
        <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border">
                <table className="w-full table-fixed border-collapse text-xs leading-5 sm:text-sm">
                    <caption className="sr-only">Basic and allchat Pro plan benefits and pricing</caption>
                    <thead>
                        <tr className="border-b">
                            <th scope="col" className="w-[38%] px-2 py-4 text-left align-bottom text-xs font-medium text-muted-foreground sm:p-5">What&apos;s included</th>
                            <th scope="col" className="w-[34%] px-2 py-4 text-center sm:p-5"><span className="block text-sm font-extrabold sm:text-base">Basic</span><span className="mt-2 block text-xs font-normal text-muted-foreground">Free</span></th>
                            <th scope="col" className="border-x border-blue-300 bg-blue-50 px-2 py-4 text-center dark:border-blue-500/40 dark:bg-blue-500/10 sm:p-5"><span className="block text-sm font-extrabold text-blue-700 dark:text-blue-300 sm:text-base">allchat Pro</span><span className="mt-2 block text-xs font-normal text-muted-foreground">{yearly ? '$50 / year' : '$5 / month'}</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {benefits.map(benefit => (
                            <tr key={benefit.label} className="border-b last:border-b-0">
                                <th scope="row" className="break-words px-2 py-4 text-left font-medium sm:px-5">{benefit.label}</th>
                                <td className="break-words px-2 py-4 text-center text-muted-foreground sm:px-3"><ComparisonValue value={benefit.basic}/></td>
                                <td className="break-words border-x border-blue-300 bg-blue-50 px-2 py-4 text-center font-semibold text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300 sm:px-3"><ComparisonValue value={benefit.pro}/></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">Guest limits also apply to unclaimed accounts. Upload allowances cover all chat attachments and are measured over the previous hour.</p>
        </div>
    );
}
