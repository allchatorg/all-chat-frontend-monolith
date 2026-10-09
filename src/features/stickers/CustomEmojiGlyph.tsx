import Image from 'next/image';
import {getSticker} from './catalog';

/** Display access is public; only sending an allowlisted custom emoji requires VIP. */
export function CustomEmojiGlyph({id}: {id: string}) {
    const emoji = getSticker(id);
    return (
        <span data-allchat-emoji={id} className="inline-block align-middle leading-none" title={emoji?.name ?? 'Unavailable emoji'}>
            {emoji ? <Image src={emoji.src} alt={`:${emoji.name}:`} width={24} height={24} unoptimized draggable={false}
                            className="inline-block h-[1.5em] w-[1.5em] object-contain align-middle"/>
                : <span role="img" aria-label="Unavailable emoji" className="inline-flex h-[1.5em] w-[1.5em] items-center justify-center rounded border border-current text-[0.8em] opacity-60">?</span>}
        </span>
    );
}
