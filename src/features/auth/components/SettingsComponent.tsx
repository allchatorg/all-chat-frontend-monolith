import React, {useEffect, useState} from 'react'
import {Button} from "@/components/ui/button";
import {ArrowLeft, Ban, Settings, User} from "lucide-react";
import {ProfileSettings} from "./ProfileSettings";
import {AccountSettings} from "./AccountSettings";
import {useThunk} from "@/lib/hooks/useThunk";
import {getAllTagsThunk} from "@/redux/settings/settingsThunk";
import {BlockedUsersSettings} from "./BlockedUsersSettings";
import {useIsMobile} from "@/lib/hooks/useIsMobile";

const DEFAULT_TAB = 'profile';

export const SettingsComponent = ({defaultTab}: { defaultTab?: string }) => {
    const [runGetAllTags, getAllTagsIsLoading, getAllTagsError] = useThunk(getAllTagsThunk);
    const isMobile = useIsMobile();

    const [activeTab, setActiveTab] = useState(defaultTab || DEFAULT_TAB);

    const [showMobileDetail, setShowMobileDetail] = useState(!!defaultTab && isMobile);

    useEffect(() => {
        runGetAllTags();
    }, [runGetAllTags]);

    useEffect(() => {
        if (isMobile && defaultTab) {
            setShowMobileDetail(true);
        }
    }, [defaultTab, isMobile]);

    const tabs = [
        {id: 'profile', label: 'Profile', icon: User},
        {id: 'account', label: 'Account', icon: Settings},
        {id: 'blocked', label: 'Blocked Users', icon: Ban}
    ];

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        if (isMobile) {
            setShowMobileDetail(true);
        }
    };

    const handleBack = () => {
        setShowMobileDetail(false);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileSettings isMobile={isMobile}/>;
            case 'account':
                return <AccountSettings isMobile={isMobile}/>;
            case 'blocked':
                return <BlockedUsersSettings isMobile={isMobile}/>;
            default:
                return <ProfileSettings isMobile={isMobile}/>;
        }
    };

    if (isMobile) {
        if (!showMobileDetail) {
            return (
                <div className="flex flex-col h-full w-full bg-background p-4">
                    <h1 className="text-2xl font-bold mb-6">Settings</h1>
                    <nav className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <Button
                                    key={tab.id}
                                    variant="outline"
                                    className="w-full justify-start h-12 text-lg"
                                    onClick={() => handleTabClick(tab.id)}
                                >
                                    <Icon className="mr-3 h-5 w-5"/>
                                    {tab.label}
                                </Button>
                            );
                        })}
                    </nav>
                </div>
            );
        } else {
            return (
                <div className="flex flex-col h-full w-full bg-background">
                    <div className="flex items-center py-4 border-b">
                        <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
                            <ArrowLeft className="h-5 w-5"/>
                        </Button>
                        <h2 className="text-lg font-semibold capitalize">
                            {tabs.find(t => t.id === activeTab)?.label || 'Settings'}
                        </h2>
                    </div>
                    <div className="flex-1 pt-4 overflow-auto">
                        {renderContent()}
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="flex h-full w-full bg-background">
            <div className="w-64 border-r bg-card">
                <div className="p-6">
                    <h1 className="text-xl font-bold">Settings</h1>
                </div>
                <nav className="px-3 space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => handleTabClick(tab.id)}
                            >
                                <Icon className="mr-2 h-4 w-4"/>
                                {tab.label}
                            </Button>
                        );
                    })}
                </nav>
            </div>
            <div className="flex-1 overflow-auto">
                {renderContent()}
            </div>
        </div>
    );
}
