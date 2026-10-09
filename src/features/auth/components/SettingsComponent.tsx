'use client';

import React, {useEffect, useState} from 'react';
import {ArrowLeft, Ban, CreditCard, Diamond, Palette, Settings, User} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {useSelector} from 'react-redux';
import {Button} from '@/components/ui/button';
import {useDialog} from '@/components/providers/DialogProvider';
import {ProfileSettings} from './ProfileSettings';
import {AccountSettings} from './AccountSettings';
import {AppearanceSettings} from './AppearanceSettings';
import {BlockedUsersSettings} from './BlockedUsersSettings';
import {useThunk} from '@/lib/hooks/useThunk';
import {getAllTagsThunk} from '@/redux/settings/settingsThunk';
import {useIsMobile} from '@/lib/hooks/useIsMobile';
import {selectUser} from '@/redux/user/userSelectors';
import {VipOffer} from '@/features/vip/VipOffer';
import {SubscriptionsSettings} from '@/features/vip/SubscriptionsSettings';
import {ROUTES} from '@/routes';
import {isStaff} from '@/models/Role';

const GROUPS = [
    {label: 'User settings', tabs: [
        {id: 'profile', label: 'Profile', icon: User},
        {id: 'account', label: 'Account', icon: Settings},
        {id: 'appearance', label: 'Appearance', icon: Palette},
        {id: 'blocked', label: 'Blocked users', icon: Ban},
    ]},
    {label: 'Billing settings', tabs: [
        {id: 'vip', label: 'allchat VIP', icon: Diamond},
        {id: 'subscriptions', label: 'Subscriptions', icon: CreditCard},
    ]},
];

export const SettingsComponent = ({defaultTab}: {defaultTab?: string}) => {
    const [runGetAllTags] = useThunk(getAllTagsThunk);
    const isMobile = useIsMobile();
    const user = useSelector(selectUser);
    const router = useRouter();
    const {close} = useDialog();
    const staff = user ? isStaff(user.role) : false;
    const [selectedTab, setActiveTab] = useState(defaultTab || 'profile');
    const activeTab = staff && selectedTab === 'vip' ? 'subscriptions' : selectedTab;
    const groups = GROUPS.map(group => ({...group, tabs: group.tabs.filter(tab => !staff || tab.id !== 'vip')}));
    const [showMobileDetail, setShowMobileDetail] = useState(Boolean(defaultTab));

    useEffect(() => {void runGetAllTags().catch(() => {});}, [runGetAllTags]);
    useEffect(() => {
        if (defaultTab) {
            setActiveTab(defaultTab);
            setShowMobileDetail(true);
        }
    }, [defaultTab]);

    const handleTabClick = (id: string) => {setActiveTab(id); setShowMobileDetail(true);};
    const renderContent = () => {
        switch (activeTab) {
            case 'account': return <AccountSettings isMobile={isMobile}/>;
            case 'appearance': return <AppearanceSettings isMobile={isMobile} onExploreVip={staff ? undefined : () => handleTabClick('vip')}/>;
            case 'blocked': return <BlockedUsersSettings isMobile={isMobile}/>;
            case 'vip': return <VipOffer onManage={() => handleTabClick('subscriptions')} onClaim={() => {
                if (!user || user.role === 'GUEST') {close(); router.push(`${ROUTES.REGISTER}&redirect=${encodeURIComponent(ROUTES.SUBSCRIPTIONS)}`);}
                else handleTabClick('account');
            }}/>;
            case 'subscriptions': return <SubscriptionsSettings onExplore={staff ? undefined : () => handleTabClick('vip')}/>;
            default: return <ProfileSettings isMobile={isMobile}/>;
        }
    };

    const navigation = <nav aria-label="Settings sections" className="space-y-6 px-3 pb-5">{groups.map(group => <div key={group.label}><h2 className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{group.label}</h2><div className="space-y-1">{group.tabs.map(tab => <Button key={tab.id} variant={activeTab === tab.id ? 'secondary' : 'ghost'} aria-current={activeTab === tab.id ? 'page' : undefined} className={`w-full justify-start ${isMobile ? 'h-12' : ''} ${tab.id === 'vip' ? 'text-violet-600 dark:text-violet-300' : ''}`} onClick={() => handleTabClick(tab.id)}><tab.icon className="mr-2 h-4 w-4"/>{tab.label}</Button>)}</div></div>)}</nav>;

    if (isMobile) return <div className="flex h-full min-h-0 w-full flex-col bg-background">
        {showMobileDetail ? <>
            <div className="flex shrink-0 items-center border-b py-3 pr-9"><Button variant="ghost" size="icon" aria-label="Back to settings" onClick={() => setShowMobileDetail(false)}><ArrowLeft className="h-5 w-5"/></Button><h2 className="text-lg font-semibold">{GROUPS.flatMap(group => group.tabs).find(tab => tab.id === activeTab)?.label}</h2></div>
            <div className={`min-h-0 flex-1 overflow-y-auto ${activeTab === 'vip' ? '' : 'p-4'}`}>{renderContent()}</div>
        </> : <><h1 className="p-6 text-2xl font-bold">Settings</h1>{navigation}</>}
    </div>;

    return <div className="flex h-full min-h-0 w-full bg-background"><aside className="w-52 shrink-0 overflow-y-auto border-r bg-muted/25"><h1 className="p-6 text-xl font-bold">Settings</h1>{navigation}</aside><div className="min-w-0 flex-1 overflow-y-auto">{renderContent()}</div></div>;
};
