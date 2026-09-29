'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {Diamond, Loader2, Type} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {UserName} from '@/components/UserName';
import {FONT_PRESETS, FontPreset, fontPresetStyle} from '@/lib/fontPresets';
import {getFontSnapshot} from '@/lib/fontStore';
import {syncOwnFontSettings} from '@/lib/fontSettingsSync';
import {selectUser} from '@/redux/user/userSelectors';
import {FontSettings, fontSettingsErrorMessage, getFontSettings, updateFontSettings} from '@/features/pro/fontSettingsApi';

interface Props {
    onExplorePro?: () => void;
}

/** Remount on account changes so a previous account's draft can never be saved. */
export function ProFontSettings(props: Props) {
    const user = useSelector(selectUser);
    return user ? <FontSettingsForm key={user.id} {...props} userId={user.id} username={user.username}
        proActive={user.proActive === true} showProBadge={user.showProBadge !== false}/> : null;
}

function FontSettingsForm({userId, username, proActive, showProBadge, onExplorePro}: Props & {
    userId: number;
    username: string;
    proActive: boolean;
    showProBadge: boolean;
}) {
    const [settings, setSettings] = useState<FontSettings | null>(null);
    const [usernameFont, setUsernameFont] = useState<FontPreset>('DEFAULT');
    const [messageFont, setMessageFont] = useState<FontPreset>('DEFAULT');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const requestVersion = useRef(0);
    const savedSettings = useRef<FontSettings | null>(null);
    const saveInFlight = useRef(false);
    const mounted = useRef(false);

    const acceptSettings = useCallback((result: FontSettings, replaceDraft = false) => {
        syncOwnFontSettings(userId, result);
        // Fresh badge/message data may already have delivered a newer snapshot.
        const next = {...result, ...getFontSnapshot(userId)};
        const previous = savedSettings.current;
        // Keep an unsaved preview through quota/focus refreshes, but replace it when
        // the saved choices change elsewhere or the subscription expires.
        if (replaceDraft || !previous || next.fontRevision !== previous.fontRevision ||
            next.usernameFont !== previous.usernameFont || next.messageFont !== previous.messageFont ||
            next.proActive !== previous.proActive) {
            setUsernameFont(next.usernameFont);
            setMessageFont(next.messageFont);
        }
        savedSettings.current = next;
        setSettings(next);
    }, [userId]);

    const refresh = useCallback(async () => {
        if (saveInFlight.current) return;
        const version = ++requestVersion.current;
        if (!savedSettings.current) setLoading(true);
        try {
            const result = await getFontSettings();
            if (version !== requestVersion.current) return;
            acceptSettings(result);
            setLoadError(null);
        } catch (failure) {
            if (version === requestVersion.current) setLoadError(fontSettingsErrorMessage(failure));
        } finally {
            if (version === requestVersion.current) setLoading(false);
        }
    }, [acceptSettings]);

    useEffect(() => {
        mounted.current = true;
        const onRefresh = () => void refresh();
        window.addEventListener('focus', onRefresh);
        window.addEventListener('allchat:pro-changed', onRefresh);
        return () => {
            mounted.current = false;
            requestVersion.current++;
            window.removeEventListener('focus', onRefresh);
            window.removeEventListener('allchat:pro-changed', onRefresh);
        };
    }, [refresh]);

    useEffect(() => {
        void refresh();
    }, [refresh, proActive]);

    // Refresh the open settings card once at the server's UTC quota boundary.
    // Focus refresh also covers a suspended/background tab returning the next day.
    const resetsAt = settings?.resetsAt;
    useEffect(() => {
        if (!resetsAt) return;
        const delay = new Date(resetsAt).getTime() - Date.now();
        if (!Number.isFinite(delay)) return;
        const timer = window.setTimeout(() => void refresh(), Math.max(0, delay) + 100);
        return () => window.clearTimeout(timer);
    }, [resetsAt, refresh]);

    const dirty = !!settings && (settings.usernameFont !== usernameFont || settings.messageFont !== messageFont);
    const canSave = !!settings?.proActive && dirty && settings.changesRemaining > 0 && !loading && !saving;

    const save = async () => {
        if (!canSave || saveInFlight.current) return;
        saveInFlight.current = true;
        const version = ++requestVersion.current;
        setSaving(true);
        setSaveError(null);
        try {
            const result = await updateFontSettings(usernameFont, messageFont);
            if (version !== requestVersion.current) return;
            acceptSettings(result, true);
            setLoadError(null);
            toast.success('Your fonts were updated.');
        } catch (failure) {
            if (version !== requestVersion.current) return;
            setSaveError(fontSettingsErrorMessage(failure));
            // Refresh entitlement and quota after a rejected or uncertain save.
            saveInFlight.current = false;
            await refresh();
        } finally {
            saveInFlight.current = false;
            if (mounted.current) setSaving(false);
        }
    };

    return <Card className="overflow-hidden border-violet-200 dark:border-violet-900">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5 text-violet-500"/>Fonts</CardTitle>
            <CardDescription>Give your username and messages a little more personality with allchat Pro.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="username-font">Username font</Label>
                    <Select value={usernameFont} onValueChange={value => {setUsernameFont(value as FontPreset); setSaveError(null);}} disabled={saving}>
                        <SelectTrigger id="username-font" className="h-auto min-h-9 [&>span]:[line-height:normal]"><SelectValue/></SelectTrigger>
                        <SelectContent>{FONT_PRESETS.map(preset => <SelectItem key={preset.id} value={preset.id}><span className="inline-block" style={fontPresetStyle(preset.id)}>{preset.label}</span></SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message-font">Message font</Label>
                    <Select value={messageFont} onValueChange={value => {setMessageFont(value as FontPreset); setSaveError(null);}} disabled={saving}>
                        <SelectTrigger id="message-font" className="h-auto min-h-9 [&>span]:[line-height:normal]"><SelectValue/></SelectTrigger>
                        <SelectContent>{FONT_PRESETS.map(preset => <SelectItem key={preset.id} value={preset.id}><span className="inline-block" style={fontPresetStyle(preset.id)}>{preset.label}</span></SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>
            <div className="min-w-0 rounded-xl bg-muted/50 p-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground">Preview</p>
                <UserName username={username || 'Your username'} usernameFont={usernameFont}
                    messageFont={messageFont} fontRevision={settings?.fontRevision ?? 0}
                    proBadgeVisible={!!settings?.proActive && showProBadge} className="font-semibold"/>
                <p className="mt-2 break-words text-sm leading-6" style={fontPresetStyle(messageFont)}>Hey everyone! A <strong>little detail</strong> makes this feel like <em>me</em>. 👋</p>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">Your choices apply to earlier and future messages. Preview freely. Saving one or both fonts together uses one change.</p>
            <p className="text-xs leading-5 text-muted-foreground">Others see your changes as chats refresh or new messages arrive.</p>
            {loading && <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Loading your font preferences…</p>}
            {loadError && <div role="alert" className="text-sm text-destructive dark:text-red-300"><p>{loadError}</p><Button variant="link" className="h-auto px-0 text-inherit" onClick={() => void refresh()}>Try again</Button></div>}
            {saveError && <p role="alert" className="text-sm text-destructive dark:text-red-300">{saveError}</p>}
            {settings && <div className="space-y-3 border-t pt-4">
                <p role="status" className="text-xs leading-5 text-muted-foreground">{settings.changesRemaining} of {settings.dailyLimit} font changes remaining today. Resets at midnight UTC.</p>
                {settings.proActive ? <Button className="w-full sm:w-auto" disabled={!canSave} onClick={() => void save()}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}{saving ? 'Saving…' : 'Save fonts'}</Button> : <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Save your fonts with allchat Pro. Both fonts return to Default when your Pro access ends.</p>
                    {onExplorePro && <Button variant="outline" className="w-full sm:w-auto" onClick={onExplorePro}><Diamond className="mr-2 h-4 w-4 text-violet-500"/>Explore allchat Pro</Button>}
                </div>}
                {settings.proActive && <p className="text-xs leading-5 text-muted-foreground">Both fonts return to Default when your Pro access ends.</p>}
            </div>}
        </CardContent>
    </Card>;
}
