import Image from 'next/image';
import {CircleHelp} from 'lucide-react';
import {cn} from '@/lib/utils';
import {getCustomReaction, isCustomReactionToken} from './catalog';

interface ReactionGlyphProps {
    emoji: string;
    className?: string;
    size?: number;
}

/** Reaction images always come from the local allowlisted catalog. */
export function ReactionGlyph({emoji, className, size = 24}: ReactionGlyphProps) {
    const reaction = getCustomReaction(emoji);
    if (reaction) {
        return <Image src={reaction.src} alt={`${reaction.name} reaction`} width={size} height={size}
                      unoptimized draggable={false} style={{width: size, height: size}}
                      className={cn('inline-block shrink-0 object-contain', className)}/>;
    }
    if (isCustomReactionToken(emoji)) {
        return <CircleHelp role="img" aria-label="Unavailable reaction" size={size}
                           className={cn('inline-block shrink-0 text-muted-foreground', className)}/>;
    }
    return <span className={cn('inline-block shrink-0 leading-none', className)} style={{fontSize: size}}>{emoji}</span>;
}
