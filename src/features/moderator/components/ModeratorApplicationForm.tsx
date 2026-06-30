"use client";

import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {ModeratorApplicationRequest} from "@/models/ModeratorApplicationRequest";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useDispatch} from "react-redux";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {submitModeratorApplicationThunk} from "@/redux/user/usersThunk";
import {useUser} from "@/lib/hooks/useUser";
import {ROUTES} from "@/routes";
import {AppDispatch} from "@/redux/store";
import {ShieldCheck} from "lucide-react";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Checkbox} from "@/components/ui/checkbox";

export function ModeratorApplicationForm() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const {user} = useUser();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<ModeratorApplicationRequest>({
        defaultValues: {
            daysAvailable: [],
            confirmVolunteer: false,
            confirmReview: false,
            confirmRemoval: false,
            confirmUnpaid: false,
        }
    });

    const onSubmit = async (data: ModeratorApplicationRequest) => {
        setSubmitting(true);
        try {
            await dispatch(submitModeratorApplicationThunk(data)).unwrap();
            toast.success("Application submitted successfully! We will review it soon.");
        } catch (error: any) {
            toast.error(error.message || "Failed to submit application.");
        } finally {
            setSubmitting(false);
        }
    };

    if (user?.appliedForModerator) {
        return (
            <Card className="w-full max-w-lg mx-auto text-center mt-12">
                <CardHeader className="pt-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <ShieldCheck className="h-8 w-8 text-primary"/>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Application Received
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                        Thank you for stepping up! Your moderator application has been submitted successfully.
                        We will review it and get back to you soon.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                    <Button
                        onClick={() => router.push(ROUTES.HOME)}
                        className="w-full sm:w-auto min-w-[200px]"
                    >
                        Return to Home
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-4xl mx-auto my-8">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Moderator Application Form</CardTitle>
                <CardDescription className="text-base mt-4 text-left max-w-3xl mx-auto space-y-2">
                    <p>Thank you for your interest in becoming a moderator.</p>
                    <p>Moderators help keep the platform lawful, usable, and safe while respecting open discussion and
                        user expression.</p>
                    <p>This role involves reviewing reported content and enforcing platform rules. It may involve
                        exposure to disturbing or explicit material.</p>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 max-w-3xl mx-auto">
                        {/* Section 1 */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold border-b pb-2">Section 1: Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="username" rules={{required: "Required"}}
                                           render={({field}) => (
                                               <FormItem><FormLabel>Username on the
                                                   platform</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                                           )}/>
                                <FormField control={form.control} name="email" rules={{required: "Required"}}
                                           render={({field}) => (
                                               <FormItem><FormLabel>Email address</FormLabel><FormControl><Input
                                                   type="email" {...field} /></FormControl><FormMessage/></FormItem>
                                           )}/>
                                <FormField control={form.control} name="timeZone" rules={{required: "Required"}}
                                           render={({field}) => (
                                               <FormItem><FormLabel>Time
                                                   zone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                                           )}/>
                                <FormField control={form.control} name="country" rules={{required: "Required"}}
                                           render={({field}) => (
                                               <FormItem><FormLabel>Country of
                                                   residence</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                                           )}/>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold border-b pb-2">Section 2: Availability &
                                Commitment</h3>
                            <FormField control={form.control} name="hoursPerWeek" rules={{required: "Required"}}
                                       render={({field}) => (
                                           <FormItem className="space-y-3">
                                               <FormLabel>How many hours per week can you realistically
                                                   moderate?</FormLabel>
                                               <FormControl>
                                                   <RadioGroup onValueChange={field.onChange} defaultValue={field.value}
                                                               className="flex flex-col space-y-1">
                                                       {['1–3', '3–5', '5–10', '10+'].map(val => (
                                                           <FormItem key={val}
                                                                     className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem
                                                               value={val}/></FormControl><FormLabel
                                                               className="font-normal">{val}</FormLabel></FormItem>
                                                       ))}
                                                   </RadioGroup>
                                               </FormControl>
                                               <FormMessage/>
                                           </FormItem>
                                       )}/>
                            <FormField control={form.control} name="daysAvailable" render={() => (
                                <FormItem>
                                    <FormLabel className="text-base">Which days are you most available?</FormLabel>
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                        <FormField key={day} control={form.control} name="daysAvailable"
                                                   render={({field}) => (
                                                       <FormItem
                                                           className="flex flex-row items-start space-x-3 space-y-0">
                                                           <FormControl><Checkbox checked={field.value?.includes(day)}
                                                                                  onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), day]) : field.onChange(field.value?.filter(v => v !== day))}/></FormControl>
                                                           <FormLabel className="font-normal">{day}</FormLabel>
                                                       </FormItem>
                                                   )}/>
                                    ))}
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold border-b pb-2">Section 3: Experience (First-timers
                                welcome)</h3>
                            <FormField control={form.control} name="hasModeratedBefore" rules={{required: "Required"}}
                                       render={({field}) => (
                                           <FormItem className="space-y-3">
                                               <FormLabel>Have you ever moderated an online community
                                                   before?</FormLabel>
                                               <FormControl>
                                                   <RadioGroup onValueChange={field.onChange} defaultValue={field.value}
                                                               className="flex flex-col space-y-1">
                                                       <FormItem
                                                           className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem
                                                           value="No"/></FormControl><FormLabel className="font-normal">No
                                                           (first-time moderator)</FormLabel></FormItem>
                                                       <FormItem
                                                           className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem
                                                           value="Yes"/></FormControl><FormLabel
                                                           className="font-normal">Yes (please describe
                                                           below)</FormLabel></FormItem>
                                                   </RadioGroup>
                                               </FormControl>
                                               <FormMessage/>
                                           </FormItem>
                                       )}/>
                            {(form.watch('hasModeratedBefore') === 'Yes') && (
                                <FormField control={form.control} name="previousPlatforms"
                                           rules={{required: "Required if yes"}} render={({field}) => (
                                    <FormItem><FormLabel>If yes, what platforms or communities?</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage/></FormItem>
                                )}/>
                            )}
                            {(form.watch('hasModeratedBefore') === 'No') && (
                                <FormField control={form.control} name="whyInterested"
                                           rules={{required: "Required if no"}} render={({field}) => (
                                    <FormItem><FormLabel>If no, why are you interested in
                                        moderating?</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage/></FormItem>
                                )}/>
                            )}
                        </div>

                        {/* Section 4 */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold border-b pb-2">Section 4: Judgment & Philosophy (Very
                                Important)</h3>
                            <FormField control={form.control} name="moderatorRoleDefinition"
                                       rules={{required: "Required"}} render={({field}) => (
                                <FormItem><FormLabel>In your own words, what do you think the role of a moderator should
                                    be?</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage/></FormItem>
                            )}/>
                            <FormField control={form.control} name="freedomBalance" rules={{required: "Required"}}
                                       render={({field}) => (
                                           <FormItem><FormLabel>How do you balance freedom of expression with platform
                                               rules and
                                               laws?</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage/></FormItem>
                                       )}/>
                            <FormField control={form.control} name="moreDangerous" rules={{required: "Required"}}
                                       render={({field}) => (
                                           <FormItem className="space-y-3">
                                               <FormLabel>Which do you think is more dangerous:</FormLabel>
                                               <FormControl>
                                                   <RadioGroup onValueChange={field.onChange} defaultValue={field.value}
                                                               className="flex flex-col space-y-1">
                                                       {['Over-moderation', 'Under-moderation', 'It depends on context'].map(val => (
                                                           <FormItem key={val}
                                                                     className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem
                                                               value={val}/></FormControl><FormLabel
                                                               className="font-normal">{val}</FormLabel></FormItem>
                                                       ))}
                                                   </RadioGroup>
                                               </FormControl>
                                               <FormMessage/>
                                           </FormItem>
                                       )}/>
                        </div>

                        {/* Section 5 */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold border-b pb-2">Section 5: Handling Difficult
                                Content</h3>
                            <FormField control={form.control} name="comfortableWithDisturbingContent"
                                       rules={{required: "Required"}} render={({field}) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Moderators may be exposed to disturbing material (violence, abuse, sexual
                                        content). Are you comfortable reviewing reports involving such content when
                                        necessary?</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value}
                                                    className="flex flex-col space-y-1">
                                            {['Yes', 'Unsure', 'No'].map(val => (
                                                <FormItem key={val}
                                                          className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem
                                                    value={val}/></FormControl><FormLabel
                                                    className="font-normal">{val}</FormLabel></FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="unsureClassificationHandling"
                                       rules={{required: "Required"}} render={({field}) => (
                                <FormItem><FormLabel>If you encounter content you are unsure how to classify, what would
                                    you do?</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage/></FormItem>
                            )}/>
                        </div>

                        {/* Section 6 */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold border-b pb-2">Section 6: Legal & Safety Awareness
                                (Plain English)</h3>
                            <FormField control={form.control} name="readTosAndGuidelines" rules={{required: "Required"}}
                                       render={({field}) => (
                                           <FormItem className="space-y-3">
                                               <FormLabel>Have you read and understood the platform’s Terms of Service
                                                   and Moderator Guidelines (provide a link to guidelines)?</FormLabel>
                                               <FormControl>
                                                   <RadioGroup onValueChange={field.onChange} defaultValue={field.value}
                                                               className="flex flex-col space-y-1">
                                                       <FormItem
                                                           className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem
                                                           value="Yes"/></FormControl><FormLabel
                                                           className="font-normal">Yes</FormLabel></FormItem>
                                                       <FormItem
                                                           className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem
                                                           value="No"/></FormControl><FormLabel className="font-normal">No
                                                           (I will before starting)</FormLabel></FormItem>
                                                   </RadioGroup>
                                               </FormControl>
                                               <FormMessage/>
                                           </FormItem>
                                       )}/>
                            <FormField control={form.control} name="understandNoDownload" rules={{required: "Required"}}
                                       render={({field}) => (
                                           <FormItem className="space-y-3">
                                               <FormLabel>Do you understand that moderators must never download illegal
                                                   content to personal devices or share it except with
                                                   NCMEC?</FormLabel>
                                               <FormControl>
                                                   <RadioGroup onValueChange={field.onChange} defaultValue={field.value}
                                                               className="flex flex-col space-y-1">
                                                       {['Yes', 'No'].map(val => (
                                                           <FormItem key={val}
                                                                     className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem
                                                               value={val}/></FormControl><FormLabel
                                                               className="font-normal">{val}</FormLabel></FormItem>
                                                       ))}
                                                   </RadioGroup>
                                               </FormControl>
                                               <FormMessage/>
                                           </FormItem>
                                       )}/>
                            <FormField control={form.control} name="willingToFollowProcedures"
                                       rules={{required: "Required"}} render={({field}) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Are you willing to follow strict procedures for reporting certain content
                                        to external authorities when required?</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value}
                                                    className="flex flex-col space-y-1">
                                            {['Yes', 'No'].map(val => (
                                                <FormItem key={val}
                                                          className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem
                                                    value={val}/></FormControl><FormLabel
                                                    className="font-normal">{val}</FormLabel></FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                        </div>

                        {/* Section 7 */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold border-b pb-2">Section 7: Confidentiality &
                                Conduct</h3>
                            <FormField control={form.control} name="agreeToKeepConfidential"
                                       rules={{required: "Required"}} render={({field}) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Moderators may have access to sensitive or private information. Do you
                                        agree to keep all moderation activities confidential?</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value}
                                                    className="flex flex-col space-y-1">
                                            {['Yes', 'No'].map(val => (
                                                <FormItem key={val}
                                                          className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem
                                                    value={val}/></FormControl><FormLabel
                                                    className="font-normal">{val}</FormLabel></FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="agreeNotToUseForPersonal"
                                       rules={{required: "Required"}} render={({field}) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Do you agree not to use moderator powers for personal disputes,
                                        retaliation, or favoritism?</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value}
                                                    className="flex flex-col space-y-1">
                                            {['Yes', 'No'].map(val => (
                                                <FormItem key={val}
                                                          className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem
                                                    value={val}/></FormControl><FormLabel
                                                    className="font-normal">{val}</FormLabel></FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                        </div>

                        {/* Section 8 */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold border-b pb-2">Section 8: Escalation & Authority</h3>
                            <FormField control={form.control} name="comfortableEnforcingAgainstAgree"
                                       rules={{required: "Required"}} render={({field}) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Are you comfortable enforcing rules against users you personally agree
                                        with?</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value}
                                                    className="flex flex-col space-y-1">
                                            {['Yes', 'Sometimes', 'No'].map(val => (
                                                <FormItem key={val}
                                                          className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem
                                                    value={val}/></FormControl><FormLabel
                                                    className="font-normal">{val}</FormLabel></FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="howToRespondToAdminOverrule"
                                       rules={{required: "Required"}} render={({field}) => (
                                <FormItem><FormLabel>If an administrator overrules your decision, how would you
                                    respond?</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage/></FormItem>
                            )}/>
                        </div>

                        {/* Section 9 */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold border-b pb-2">Section 9: Optional Admin Track
                                (Optional)</h3>
                            <FormField control={form.control} name="interestedInAdmin" render={({field}) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Would you be interested in eventually taking on additional responsibility
                                        (training mods, handling escalations, admin duties)?</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value}
                                                    className="flex flex-col space-y-1">
                                            {['Yes', 'Maybe', 'No'].map(val => (
                                                <FormItem key={val}
                                                          className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem
                                                    value={val}/></FormControl><FormLabel
                                                    className="font-normal">{val}</FormLabel></FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                            {(form.watch('interestedInAdmin') === 'Yes' || form.watch('interestedInAdmin') === 'Maybe') && (
                                <FormField control={form.control} name="whyInterestedInAdmin" render={({field}) => (
                                    <FormItem><FormLabel>If yes,
                                        why?</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage/></FormItem>
                                )}/>
                            )}
                        </div>

                        {/* Section 10 */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold border-b pb-2">Section 10: Colored username</h3>
                            <FormField control={form.control} name="agreeToColoredName" rules={{required: "Required"}}
                                       render={({field}) => (
                                           <FormItem className="space-y-3">
                                               <FormLabel>Moderators and administrators must identify themselves in the
                                                   chat with a colored name. Do you agree to have your username colored
                                                   light blue in the chat if moderator and dark blue if
                                                   admin?</FormLabel>
                                               <FormControl>
                                                   <RadioGroup onValueChange={field.onChange} defaultValue={field.value}
                                                               className="flex flex-col space-y-1">
                                                       {['Yes', 'No'].map(val => (
                                                           <FormItem key={val}
                                                                     className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem
                                                               value={val}/></FormControl><FormLabel
                                                               className="font-normal">{val}</FormLabel></FormItem>
                                                       ))}
                                                   </RadioGroup>
                                               </FormControl>
                                               <FormMessage/>
                                           </FormItem>
                                       )}/>
                        </div>

                        {/* Section 11 */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold border-b pb-2">Section 11: Final Acknowledgment</h3>
                            <div className="space-y-4">
                                <Label>Please confirm:</Label>
                                <FormField control={form.control} name="confirmVolunteer" rules={{required: "Required"}}
                                           render={({field}) => (
                                               <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                   <FormControl><Checkbox checked={field.value}
                                                                          onCheckedChange={field.onChange}/></FormControl>
                                                   <FormLabel className="font-normal">I understand this is a volunteer /
                                                       trust-based role.</FormLabel>
                                                   <FormMessage/>
                                               </FormItem>
                                           )}/>
                                <FormField control={form.control} name="confirmReview" rules={{required: "Required"}}
                                           render={({field}) => (
                                               <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                   <FormControl><Checkbox checked={field.value}
                                                                          onCheckedChange={field.onChange}/></FormControl>
                                                   <FormLabel className="font-normal">I understand moderation decisions
                                                       may be reviewed or reversed.</FormLabel>
                                                   <FormMessage/>
                                               </FormItem>
                                           )}/>
                                <FormField control={form.control} name="confirmRemoval" rules={{required: "Required"}}
                                           render={({field}) => (
                                               <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                   <FormControl><Checkbox checked={field.value}
                                                                          onCheckedChange={field.onChange}/></FormControl>
                                                   <FormLabel className="font-normal">I understand failure to follow
                                                       procedures may result in removal as a moderator.</FormLabel>
                                                   <FormMessage/>
                                               </FormItem>
                                           )}/>
                                <FormField control={form.control} name="confirmUnpaid" rules={{required: "Required"}}
                                           render={({field}) => (
                                               <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                   <FormControl><Checkbox checked={field.value}
                                                                          onCheckedChange={field.onChange}/></FormControl>
                                                   <FormLabel className="font-normal">I understand that this position is
                                                       unpaid.</FormLabel>
                                                   <FormMessage/>
                                               </FormItem>
                                           )}/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <FormField control={form.control} name="signature" rules={{required: "Required"}}
                                           render={({field}) => (
                                               <FormItem><FormLabel>Signature (typed
                                                   name)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                                           )}/>
                                <FormField control={form.control} name="date" rules={{required: "Required"}}
                                           render={({field}) => (
                                               <FormItem><FormLabel>Date</FormLabel><FormControl><Input
                                                   type="date" {...field} /></FormControl><FormMessage/></FormItem>
                                           )}/>
                            </div>
                        </div>

                        <Button type="submit" className="w-full text-lg h-12 mt-8" disabled={submitting}>
                            {submitting ? "Submitting Application..." : "Submit Application"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
