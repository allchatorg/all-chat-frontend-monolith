import type {User} from '@/models/User';
import type {RequiredVerification} from '@/models/RequiredVerification';

export function requiredAccountVerification(user: User | null, required: RequiredVerification = 'NONE'): 'NONE' | 'CLAIM' | 'EMAIL' | 'PHONE' | 'ID' {
    if (!user || user.role === 'GUEST') return 'NONE';
    if (!user.claimed && required !== 'NONE') return 'CLAIM';
    if (required === 'EMAIL' && !user.verified) return 'EMAIL';
    if (required === 'PHONE') {
        if (!user.email || !user.verified) return 'EMAIL';
        if (!user.phoneNumberVerificationDate) return 'PHONE';
    }
    if (user.idVerificationStatus === 'REQUIRED' || user.idVerificationStatus === 'PENDING' || user.idVerificationStatus === 'REJECTED') return 'ID';
    return 'NONE';
}

export function isChatRestricted(user: User | null, required: RequiredVerification = 'NONE'): boolean {
    return Boolean(user && (user.banned || requiredAccountVerification(user, required) !== 'NONE' || (user.role === 'GUEST' && required !== 'NONE')));
}
