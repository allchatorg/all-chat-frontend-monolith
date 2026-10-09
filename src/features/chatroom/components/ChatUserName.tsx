'use client';

import {UserName, UserNameProps} from '@/components/UserName';
import {useVipDialog} from '@/features/vip/useVipDialog';
import {cn} from '@/lib/utils';

export function ChatUserName({className, ...props}: Omit<UserNameProps, 'onVipClick'>) {
    const openVip = useVipDialog();

    return <UserName {...props} className={cn('dark:text-slate-200', className)} onVipClick={openVip}/>;
}
