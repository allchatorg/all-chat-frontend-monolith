'use client';

import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from 'next-themes';
import {Diamond, Loader2} from 'lucide-react';
import {toast} from 'sonner';
import {RootState} from '@/redux/store';
import {selectUser} from '@/redux/user/userSelectors';
import {setShowAppBackground} from '@/redux/settings/settingsSlice';
import {updateUserDisplayColorThunk} from '@/redux/user/usersThunk';
import {useThunk} from '@/lib/hooks/useThunk';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {Switch} from '@/components/ui/switch';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {ColorPicker} from '@/components/ColorPickerEditor';
import {UserName} from '@/components/UserName';
import {RoomTabOrderSettings} from './RoomTabOrderSettings';
import {ProFontSettings} from './ProFontSettings';
import {proErrorMessage, updateProAppearance} from '@/features/pro/api';
import {notifyProChanged, syncProAppearance, useProSubscription} from '@/features/pro/useProSubscription';

export function AppearanceSettings({isMobile = false, onExplorePro}: {isMobile?: boolean; onExplorePro?: () => void}) {
    const user = useSelector(selectUser);
    const {theme, setTheme} = useTheme();
    const dispatch = useDispatch();
    const showAppBackground = useSelector((state: RootState) => state.settings.showAppBackground !== false);
    const [changeColor, changeColorLoading] = useThunk(updateUserDisplayColorThunk);
    const [savingBadge, setSavingBadge] = useState(false);
    const {subscription, loading, error, refresh} = useProSubscription();
    const proActive = subscription?.proActive ?? user?.proActive === true;
    const showBadge = user?.showProBadge !== false;

    const toggleBadge = async (showProBadge: boolean) => {
        if (!user) return;
        setSavingBadge(true);
        try {
            const appearance = await updateProAppearance(showProBadge);
            syncProAppearance(user.id, appearance);
            notifyProChanged();
            toast.success(showProBadge ? 'Your VIP badge is visible.' : 'Your VIP badge is hidden.');
        } catch (failure) {
            toast.error(proErrorMessage(failure));
        } finally {
            setSavingBadge(false);
        }
    };

    return <div className="space-y-4 p-0 md:space-y-6 md:p-6">
        {!isMobile && <div><h1 className="text-3xl font-bold tracking-tight">Appearance</h1><p className="mt-1 text-muted-foreground">Make allchat feel like you.</p></div>}
        <Card>
            <CardHeader><CardTitle>Look and feel</CardTitle><CardDescription>Choose your theme and organize your chatrooms.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2"><Label htmlFor="appearance-theme">Theme</Label><Select value={theme} onValueChange={setTheme}><SelectTrigger id="appearance-theme"><SelectValue placeholder="Select theme"/></SelectTrigger><SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent></Select></div>
                <div className="flex items-center justify-between gap-4 rounded-xl border p-4"><div className="space-y-1"><Label htmlFor="showAppBackground">Show background image</Label><p className="text-xs leading-5 text-muted-foreground">Use the themed background artwork behind the app.</p></div><Switch id="showAppBackground" checked={showAppBackground} onCheckedChange={checked => dispatch(setShowAppBackground(checked))}/></div>
                <RoomTabOrderSettings/>
            </CardContent>
        </Card>
        <ColorPicker currentColor={user?.displayColor || '#000000'} isLoading={changeColorLoading} onColorChange={color => {
            if (!user) return;
            changeColor({userId: user.id, color}).then(() => toast.success('Display color updated.')).catch(() => toast.error('Could not update display color.'));
        }}/>
        <ProFontSettings onExplorePro={onExplorePro}/>
        <Card className="overflow-hidden border-violet-200 dark:border-violet-900">
            <CardHeader><CardTitle className="flex items-center gap-2"><Diamond className="h-5 w-5 text-violet-500"/>VIP badge</CardTitle><CardDescription>A little extra next to your name. You decide when it shows.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
                <div className="rounded-xl bg-muted/50 p-4"><p className="mb-2 text-xs font-medium text-muted-foreground">Username preview</p><div className="min-w-0 font-semibold"><UserName userId={user?.id} username={user?.username || 'Your username'} usernameFont={user?.usernameFont} messageFont={user?.messageFont} fontRevision={user?.fontRevision} proBadgeVisible={proActive && showBadge} proBadgeRevision={user?.proBadgeRevision} className="max-w-full"/></div></div>
                <div className="flex items-center justify-between gap-4"><div><Label htmlFor="show-pro-badge">Show my VIP badge</Label><p className="mt-1 text-xs leading-5 text-muted-foreground">Visible beside your username throughout allchat.</p></div><div className="flex items-center gap-2">{savingBadge && <Loader2 aria-label="Saving" className="h-4 w-4 animate-spin"/>}<Switch id="show-pro-badge" checked={showBadge} disabled={!proActive || loading || savingBadge || !!error} onCheckedChange={checked => void toggleBadge(checked)}/></div></div>
                {error && <p role="alert" className="text-sm text-destructive dark:text-red-300">Could not load your VIP preferences. <button className="underline" onClick={() => void refresh()}>Try again</button></p>}
                {!loading && !proActive && !error && <div className="border-t pt-4"><p className="text-sm text-muted-foreground">The badge is included with allchat VIP.</p>{onExplorePro && <Button variant="link" className="px-0 text-violet-600 dark:text-violet-300" onClick={onExplorePro}>Explore allchat VIP</Button>}</div>}
            </CardContent>
        </Card>
    </div>;
}
