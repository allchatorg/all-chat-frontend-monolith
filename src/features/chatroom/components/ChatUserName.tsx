'use client';

import {UserName, UserNameProps} from '@/components/UserName';
import {useProDialog} from '@/features/pro/useProDialog';

export function ChatUserName(props: Omit<UserNameProps, 'onProClick'>) {
    const openPro = useProDialog();

    return <UserName {...props} onProClick={openPro}/>;
}
