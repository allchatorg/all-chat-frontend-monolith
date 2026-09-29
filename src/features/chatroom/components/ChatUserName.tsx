'use client';

import {UserName, UserNameProps} from '@/components/UserName';
import {useProDialog} from '@/features/pro/useProDialog';
import {cn} from '@/lib/utils';

export function ChatUserName({className, ...props}: Omit<UserNameProps, 'onProClick'>) {
    const openPro = useProDialog();

    return <UserName {...props} className={cn('dark:text-slate-200', className)} onProClick={openPro}/>;
}
