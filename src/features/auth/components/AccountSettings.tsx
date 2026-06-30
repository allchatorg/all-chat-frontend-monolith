import React, {useState} from 'react';
import {Separator} from "@/components/ui/separator";

import {EmailVerification} from "@/features/auth/components/EmailVerification";
import {User} from "@/models/User";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@/redux/store";
import {selectUser} from "@/redux/user/userSelectors";
import {
    sendEmailVerificationThunk,
    sendPhoneVerificationThunk,
    updateBlurredContentThunk,
    updateMarketingPreferencesThunk,
    updateTimeFormatThunk,
    verifyEmailThunk,
    verifyPhoneThunk
} from "@/redux/user/usersThunk";
import {changePassword} from "@/api/user/userAPI";
import {ChangePassword} from "@/features/auth/components/ChangePassword";
import {ChangePasswordRequest} from "@/models/ChangePasswordRequest";
import {ClaimUser} from "@/features/auth/components/ClaimUser";
import {useThunk} from "@/lib/hooks/useThunk";
import {toast} from "sonner";
import BlurredContentSettings from "@/features/chatroom/components/BlurredContentSettings";
import {Tag} from "@/models/Tag";
import {claimAccountThunk} from "@/redux/auth/authThunk";
import {AccountDeleteComponent} from "@/features/auth/components/AccountDeleteComponent";
import {PhoneSettings} from "@/features/auth/components/PhoneSettings";
import TimeFormatSettingsCard from "@/features/auth/components/TimeFormatSettingsCard";
import {useFormatMessageDate} from "@/lib/hooks/useTimeFormatSetting";
import {TimeFormat} from "@/models/TimeFormat";
import {UpdateEmail} from "@/features/auth/components/UpdateEmail";
import {EmailSettings} from "@/features/auth/components/EmailSettings";

interface AccountSettingsProps {
    isMobile?: boolean;
}

export const AccountSettings = ({isMobile = false}: AccountSettingsProps) => {

    const user: User | null = useSelector((state: RootState) => selectUser(state));
    const settings = useSelector((state: RootState) => state.settings);

    const dispatch: AppDispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    const [claimed, setClaimed] = useState(user?.claimed ?? false)
    const {timeFormat: currentTimeFormat} = useFormatMessageDate();

    const [runClaimAccount, claimAccountLoading, claimAccountError] = useThunk(claimAccountThunk);
    const [runUpdateBlurredContent, updateBlurredContentLoading, updateBlurredContentError] = useThunk(updateBlurredContentThunk);
    const [runVerifyPhoneThunk, verifyPhoneLoading, verifyPhoneError] = useThunk(verifyPhoneThunk);
    const [runSendPhoneVerificationThunk, sendPhoneVerificationIsLoading, sendPhoneVerificationError] = useThunk(sendPhoneVerificationThunk);
    const [sendMailVerification] = useThunk(sendEmailVerificationThunk);
    const [runUpdateTimeFormat, isUpdating, updateError] = useThunk(updateTimeFormatThunk);
    const [runUpdateMarketingPreferences, updateMarketingPreferencesLoading] = useThunk(updateMarketingPreferencesThunk);

    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        setLoading(true)
        try {
            const changedPassword: ChangePasswordRequest = {
                currentPassword,
                newPassword
            }
            await changePassword(changedPassword)
        } catch (error: any) {
        } finally {
            setLoading(false)
        }
    }

    const handleClaimUser = async (email: string, password: string) => {
        try {
            const response = await runClaimAccount({email, password});
            if (response) {
                setClaimed(true);
            }
        } catch (error) {
            toast.error("Claim failed");
        }
    };

    const handleBlurredContentPreferences = async (selectedTags: Tag[]) => {
        try {
            const tagIds = selectedTags.map(tag => tag.id);
            await runUpdateBlurredContent(tagIds);
            toast.success("Blurred content preferences updated successfully.");
        } catch (error) {
            toast.error("Failed to update blurred content preferences.");
        }
    }

    const handleToggleTimeFormat = async () => {
        const newFormat = currentTimeFormat === TimeFormat.H12 ? TimeFormat.H24 : TimeFormat.H12;
        try {
            await runUpdateTimeFormat({timeFormat: newFormat});
            toast.success("Time format updated successfully.");
        } catch (err) {
            console.error("Failed to update time format", err);
        }
    };

    const handleUpdateMarketingPreferences = async (subscribedToMarketingEmails: boolean) => {
        try {
            await runUpdateMarketingPreferences({subscribedToMarketingEmails});
            toast.success("Email preferences updated successfully.");
        } catch (error) {
            toast.error("Failed to update email preferences.");
            throw error;
        }
    };

    return (
        <div className="p-0 md:p-6 space-y-4 md:space-y-6">
            {!isMobile && (
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account security and preferences.
                    </p>
                </div>
            )}


            <ClaimUser
                claimed={claimed}
                loading={claimAccountLoading}
                onClaim={handleClaimUser}
            />

            {user?.claimed &&
                <>
                    {<EmailVerification
                        verified={user?.verified}
                        email={user?.email}
                        onVerify={(token: string) => {
                            if (token) {
                                dispatch(verifyEmailThunk(token));
                            }
                        }}
                        onResend={() => {
                            sendMailVerification();
                        }}
                    />}

                    <Separator/>

                    {user?.verified && (
                        <>
                            <EmailSettings
                                subscribedToMarketingEmails={user?.subscribedToMarketingEmails}
                                onUpdateMarketing={handleUpdateMarketingPreferences}
                                isLoading={updateMarketingPreferencesLoading}
                            />
                            <Separator/>
                        </>
                    )}

                    {/* Change Password */}
                    <ChangePassword onChangePassword={handleChangePassword} loading={loading}/>

                    <UpdateEmail currentEmail={user?.email}/>
                    <Separator/>
                    <PhoneSettings
                        user={user}
                        onAddPhone={runSendPhoneVerificationThunk}
                        onVerifyCode={runVerifyPhoneThunk}
                        error={verifyPhoneError || sendPhoneVerificationError}
                        loading={verifyPhoneLoading || sendPhoneVerificationIsLoading}
                    />
                </>
            }

            <Separator/>


            <BlurredContentSettings selectedTags={user?.blurredContentTags || []} tags={settings.blurredContent || []}
                                    onSaveBlurredContentPreferences={handleBlurredContentPreferences}
                                    isOver18={user?.isOver18}/>


            <Separator/>

            <TimeFormatSettingsCard
                timeFormat={currentTimeFormat}
                onToggle={handleToggleTimeFormat}
                isUpdating={isUpdating}
                error={updateError?.message}
            />

            <Separator/>

            <AccountDeleteComponent userId={user?.id}/>
        </div>
    );
};
