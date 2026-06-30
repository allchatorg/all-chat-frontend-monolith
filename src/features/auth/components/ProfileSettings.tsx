import {ChangeEvent, useEffect, useState} from "react";
import {Check, Loader2, Pencil, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {useDispatch, useSelector} from "react-redux";
import {selectUser} from "@/redux/user/userSelectors";
import {changeUsernameThunk, updateAgeThunk, updateUserDisplayColorThunk} from "@/redux/user/usersThunk";
import {AppDispatch, RootState} from "@/redux/store";
import {User} from "@/models/User";
import {toast} from "sonner";
import {ColorPicker} from "@/components/ColorPickerEditor";
import {useThunk} from "@/lib/hooks/useThunk";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useTheme} from "next-themes";
import {Switch} from "@/components/ui/switch";
import {setShowAppBackground} from "@/redux/settings/settingsSlice";

interface ProfileSettingsProps {
    isMobile?: boolean;
}

export const ProfileSettings = ({isMobile = false}: ProfileSettingsProps) => {
    const {theme, setTheme} = useTheme();
    const user: User | null = useSelector((state: RootState) => selectUser(state));
    const showAppBackground = useSelector((state: RootState) => state.settings.showAppBackground !== false);
    const dispatch: AppDispatch = useDispatch();

    const [changeColor, changeColorIsLoading, changeColorError] = useThunk(updateUserDisplayColorThunk);

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [tempUsername, setTempUsername] = useState<string>(user?.username || "");
    const [tempIsOver18, setTempIsOver18] = useState<boolean>(user?.isOver18 || false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        setTempUsername(user?.username || "");
        setTempIsOver18(user?.isOver18 || false);
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        setError("");
        try {
            await dispatch(changeUsernameThunk(tempUsername)).unwrap();
            toast("Username updated successfully.");
            setIsEditing(false);
        } catch (err: any) {
            setError(err?.message || "Failed to update username");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setTempUsername(user?.username || "");
        setIsEditing(false);
        setError("");
    };

    const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTempUsername(e.target.value);
    };

    const handleIsOver18Change = async (checked: boolean) => {
        setTempIsOver18(checked);
        try {
            await dispatch(updateAgeThunk(checked)).unwrap();
            toast("Age updated successfully.");
        } catch (err: any) {
            setTempIsOver18(!checked);
            setError(err?.message || "Failed to update age verification");
        }
    };

    const hasChanges = tempUsername !== user?.username;

    const handleColorChange = (colorValueHex: string) => {
        if (!user) return;
        changeColor({userId: user.id, color: colorValueHex}).then(() => {
            toast.success("Display color updated successfully.");
        }).catch((err: any) => {
            toast.error(err?.message || "Failed to update display color");
        });
    };

    return (
        <div className="p-0  md:p-6 space-y-4 md:space-y-6">
            {!isMobile && (
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                    <p className="text-muted-foreground">
                        Manage your personal information and preferences.
                    </p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                        Update your profile details and personal information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Separator/>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="username"
                                value={tempUsername}
                                onChange={handleUsernameChange}
                                disabled={!isEditing || isSaving}
                            />
                            {!isEditing ? (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Pencil className="h-4 w-4"/>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={isSaving}
                                        onClick={handleCancel}
                                    >
                                        <X className="h-4 w-4"/>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleSave}
                                        disabled={
                                            isSaving ||
                                            !tempUsername ||
                                            !hasChanges
                                        }
                                    >
                                        {isSaving ? (
                                            <Loader2 className="h-4 w-4 animate-spin"/>
                                        ) : (
                                            <Check className="h-4 w-4"/>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                    </div>

                    <div className="space-y-2 hidden">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isOver18"
                                checked={tempIsOver18}
                                onCheckedChange={handleIsOver18Change}
                                disabled={isSaving}
                            />
                            <Label
                                htmlFor="isOver18"
                                className="peer-disabled:cursor-not-allowed text-sm font-medium leading-none peer-disabled:opacity-70"
                            >
                                I am 18 years or older
                            </Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Customize the appearance of the application. Automatically switch between day
                        and night themes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Separator/>
                    <div className="space-y-2">
                        <Label>Theme</Label>
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select theme"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[0.8rem] text-muted-foreground">
                            Select the theme for the dashboard.
                        </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-md border p-4">
                        <div className="space-y-1">
                            <Label htmlFor="showAppBackground">Show background image</Label>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Use the themed background artwork behind the app.
                            </p>
                        </div>
                        <Switch
                            id="showAppBackground"
                            checked={showAppBackground}
                            onCheckedChange={(checked) => dispatch(setShowAppBackground(checked))}
                        />
                    </div>
                </CardContent>
            </Card>
            <ColorPicker currentColor={user ? user.displayColor : "F00000"} onColorChange={handleColorChange}
                         isLoading={changeColorIsLoading}/>
        </div>
    );
};
