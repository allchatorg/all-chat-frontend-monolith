"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useDialog} from "@/components/providers/DialogProvider";
import PrivacyPolicy from "@/components/PrivacyPolicy";

export default function TermsOfService() {
    const {open} = useDialog();
    return (
        <div className="w-[85vw] md:w-[600px] max-h-[80vh] overflow-y-auto p-2 space-y-5    ">
            <Card className="border-0 shadow-none">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center mb-2">
                        Terms of Service
                    </CardTitle>
                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                        Last Updated: February 6, 2026
                    </p>
                </CardHeader>
                <CardContent className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            Welcome to allchat, a website (the “Site”) operated by allchat LLC
                            (the “Company”). By accessing, browsing, or using the Site and any
                            related services (collectively, the “Service”), you acknowledge that
                            you have read, understood, and agree to be bound by these Terms of
                            Service (“Terms”) and our <button type="button"
                                                              onClick={() => open(<div className="max-w-4xl">
                                                                  <PrivacyPolicy/></div>)}
                                                              className="text-blue-600 dark:text-blue-400 hover:underline">Privacy
                            Policy</button>. If you do not agree, you
                            must not use the Service. You represent that you are legally able to
                            enter into these Terms and that your use complies with all
                            applicable laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">2. Eligibility</h2>
                        <p>
                            You must be at least 18 years old to use this Service. By using the
                            Service, you represent and warrant that you meet this requirement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">3. Use of the Service</h2>
                        <p>
                            You agree to use the Service only for lawful purposes and in
                            accordance with these Terms. You may not use the Service in any way
                            that:
                        </p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Violates any applicable law or regulation</li>
                            <li>Infringes the rights of others</li>
                            <li>Interferes with or disrupts the Service or its users</li>
                            <li>Attempts to gain unauthorized access to any systems or accounts</li>
                            <li>Uses automated tools (bots, scrapers, etc.) without permission</li>
                        </ul>
                        <p className="mt-2">
                            We reserve the right to investigate and take appropriate action
                            against any misuse of the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            4. User-Generated Content
                        </h2>
                        <p>
                            The Service may allow users to submit, post, or share content
                            (“User Content”). You retain ownership of your User Content, but by
                            submitting it, you grant us a non-exclusive, worldwide, royalty-free
                            transferable and sub-licensable license to use, host, copy, modify,
                            store, display, distribute, publish, transmit, and process your User
                            Content solely for operating and improving the Service and for legal
                            compliance.
                        </p>
                        <p className="mt-2">
                            You are solely responsible for the content you submit and represent
                            that you have all rights necessary to do so.
                        </p>
                        <p className="mt-2">
                            Other users may access and share your User Content and information,
                            via the Site, social media, email, and otherwise.
                        </p>
                        <p className="mt-2">
                            If you wish us to remove your User Content from the Site, please
                            send an email to dmca@allchat.org and we will do so within ten
                            business days of receiving your request. (However, we may retain
                            copies of your User Content, not accessible to the public, on our
                            backup servers even after you request removal.)
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">5. Prohibited Content</h2>
                        <p>
                            You may not post, upload, transmit, or otherwise make available any
                            content that:
                        </p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Is illegal, unlawful, or promotes illegal activity</li>
                            <li>Is malicious, false or inaccurate</li>
                            <li>Exploits or endangers minors, including any form of child sexual abuse material (CSAM)
                            </li>
                            <li>Depicts or promotes non-consensual sexual violence</li>
                            <li>Depicts extreme violence, torture, or cruelty to humans or animals created for the
                                purpose of sexual arousal
                            </li>
                            <li>Constitutes terrorist propaganda or material support for designated terrorist
                                organizations
                            </li>
                            <li>Violates intellectual property or privacy rights</li>
                            <li>Is obscene, defamatory, or harassing</li>
                            <li>Encourages self-harm or suicide</li>
                            <li>Intends to bypass content warnings, filters, or labeling requirements</li>
                        </ul>
                        <p className="mt-2">
                            We reserve the right to remove any content at our discretion and to
                            report suspected illegal activity to appropriate authorities.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            6. Moderation and Enforcement
                        </h2>
                        <p className="font-medium mb-2">
                            Content Labeling, NSFW Material, and Warnings
                        </p>
                        <p>
                            The Service provides separate upload mechanisms and content labeling
                            options to help users identify and filter certain types of content.
                            Users who upload content are required to accurately categorize and
                            label their submissions.
                        </p>

                        <div className="mt-4">
                            <h3 className="font-semibold">a. NSFW Content</h3>
                            <p>
                                Content that is not safe for work, including but not limited to
                                explicit sexual content, graphic violence, gore, or other
                                disturbing material, must be uploaded using the designated NSFW
                                upload option.
                            </p>
                            <p className="mt-1">
                                NSFW uploads require the user to select one or more applicable
                                warnings, which includes:
                            </p>
                            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                <li>Explicit content</li>
                                <li>Gore</li>
                                <li>Gross</li>
                            </ul>
                            <p className="mt-1">
                                We do not pre-screen all content but reserve the right to review,
                                remove, restrict access to, or disable any content or account at
                                any time, with or without notice, for any reason, including
                                suspected violations of these Terms or applicable law.
                            </p>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold">b. Additional Content Warnings</h3>
                            <p>
                                Certain content types require additional warnings, including but
                                not limited to:
                            </p>
                            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                <li>Jumpscares</li>
                                <li>Flashing imagery or epilepsy-related risks</li>
                            </ul>
                            <p className="mt-1">
                                Users are responsible for selecting all applicable warnings at the
                                time of upload.
                            </p>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold">
                                c. User Responsibility for Accurate Labeling
                            </h3>
                            <p>
                                Users are solely responsible for ensuring that uploaded content is
                                accurately labeled and categorized. Failure to properly label
                                content, including uploading NSFW material through SFW upload
                                mechanisms or omitting required warnings, constitutes a violation
                                of these Terms.
                            </p>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold">d. User Filters and Viewing Controls</h3>
                            <p>
                                The Service allows users to control their viewing preferences,
                                including disabling the display of certain content categories.
                                Users acknowledge that content visibility depends on user-applied
                                filters and uploader-provided labels, and that no system is
                                perfect.
                            </p>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold">e. Enforcement</h3>
                            <p>The Service reserves the right to:</p>
                            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                <li>Monitor access to or use of the Site or Service</li>
                                <li>Remove or reclassify User Content</li>
                                <li>Apply warnings or restrictions</li>
                                <li>Suspend or terminate accounts</li>
                                <li>Take any other action deemed appropriate</li>
                            </ul>
                            <p className="mt-1">
                                These actions may be taken if content is improperly labeled,
                                misleading, or otherwise violates these Terms or applicable law.
                            </p>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold">f. No Guarantee of Content Classification</h3>
                            <p>
                                The Service does not guarantee that all User Content will be
                                accurately labeled by users. Users view content at their own
                                discretion and risk.
                            </p>
                            <p className="mt-1">
                                We may preserve and disclose information, including User Content
                                and account data, if required by law or if we reasonably believe
                                such disclosure is necessary to comply with legal obligations,
                                protect our rights, or ensure the safety of users or the public.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">7. Accounts and Security</h2>
                        <p>
                            If you create an account, you are responsible for maintaining the
                            confidentiality of your login credentials and for all activity that
                            occurs under your account. You agree to notify us immediately of any
                            unauthorized use or security breach.
                        </p>
                        <p className="mt-2">
                            We are not responsible for losses resulting from unauthorized access
                            caused by your failure to safeguard your credentials.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">8. Termination</h2>
                        <p>
                            We may suspend or terminate your access to the Service at any time,
                            with or without notice, if we believe you have violated these Terms,
                            pose a risk to the Service or other users, or for any other lawful
                            reason.
                        </p>
                        <p className="mt-2">You may stop using the Service at any time.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            9. Disclaimer of Warranties
                        </h2>
                        <p className="uppercase">
                            The Service is provided “as is” and “as available,” without
                            warranties of any kind, express or implied, including but not
                            limited to warranties of merchantability, fitness for a particular
                            purpose, or non-infringement.
                        </p>
                        <p className="mt-2">
                            We do not guarantee that the Service will be uninterrupted, secure,
                            or error-free.
                        </p>
                        <p className="mt-2">
                            Opinions, advice, statements, offers, or other information or content
                            made available through the Site, but not directly by the Company, are
                            those of their respective authors, and should not necessarily be
                            relied upon. Such authors are solely responsible for such content.
                        </p>
                        <p className="mt-2">
                            The Company does not guarantee the accuracy, completeness, or
                            usefulness of any information on the Site and neither does the
                            Company adopt nor endorse, nor is the Company responsible for, the
                            accuracy or reliability of any opinion, advice, or statement made by
                            parties other than the Company. The Company takes no responsibility
                            and assumes no liability for any User Content that you or any other
                            user or third-party posts or sends over the Site. Under no
                            circumstances will the Company be responsible for any loss or damage
                            resulting from anyone’s reliance on information or other content
                            posted on the Site or transmitted to users.
                        </p>
                        <p className="mt-2 uppercase font-semibold">
                            SOME JURISDICTIONS LIMIT OR DO NOT PERMIT DISCLAIMERS OF WARRANTY,
                            SO THIS PROVISION MAY NOT APPLY TO YOU.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            10. Limitation of Liability
                        </h2>
                        <p>
                            To the maximum extent permitted by law, we shall not be liable for
                            any loss of profits, use, or data or for any indirect, special,
                            incidental, consequential, or punitive damages arising from or
                            related to your use of, or inability to use, the Service.
                        </p>
                        <p className="mt-2">
                            Our total liability for any claim shall not exceed the amount you
                            paid to us (if any) in the prior 12 months or $10, whichever is
                            less.
                        </p>
                        <p className="mt-2 uppercase font-semibold">
                            SOME JURISDICTIONS LIMIT OR DO NOT PERMIT DISCLAIMERS OF LIABILITY,
                            SO THIS PROVISION MAY NOT APPLY TO YOU.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">11. Indemnification</h2>
                        <p>
                            You agree to indemnify, defend, and hold harmless the Service, its
                            owners, operators, and affiliates from any claims, damages,
                            liabilities, and expenses related to or arising out of a) your use
                            or misuse of the Service, b) your violation of these Terms, or c)
                            your User Content.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            12. Changes to the Terms
                        </h2>
                        <p>
                            We may modify these Terms at any time. Updated Terms will be posted
                            on this page with a revised “Last Updated” date. Continued use of
                            the Service after changes constitutes acceptance of the revised
                            Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">13. Governing Law</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with
                            the laws of New Jersey, without regard to conflict of law
                            principles.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            14. Copyright Policy and DMCA Notice
                        </h2>
                        <p>
                            The Service respects the intellectual property rights of others and
                            expects users to do the same.
                        </p>

                        <div className="mt-4">
                            <h3 className="font-semibold">a. Reporting Copyright Infringement</h3>
                            <p>
                                If you believe that content on the Service infringes your
                                copyright, you may submit a written notification in accordance
                                with the Digital Millennium Copyright Act (“DMCA”) to our
                                designated copyright agent.
                            </p>
                            <p className="mt-1">Your notice must include:</p>
                            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                <li>The date of your notification</li>
                                <li>Identification of the copyrighted work claimed to be infringed</li>
                                <li>Identification of the allegedly infringing material and its location on the
                                    Service
                                </li>
                                <li>Your contact information (name, address, email)</li>
                                <li>A statement that you have a good-faith belief that the use is not authorized</li>
                                <li>A statement, under penalty of perjury, that the information is accurate and that you
                                    are the copyright owner or authorized to act on their behalf
                                </li>
                                <li>Your physical or electronic signature</li>
                            </ul>
                            <p className="mt-1">
                                DMCA notices should be sent to <a href="mailto:dmca@allchat.org"
                                                                  className="text-blue-600 dark:text-blue-400 hover:underline">dmca@allchat.org</a>.
                            </p>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold">b. Response to DMCA Notices</h3>
                            <p>
                                Upon receipt of a valid DMCA notice, the Service will remove or
                                disable access to the allegedly infringing content and may notify
                                the user who posted the content. Repeat infringers may have their
                                accounts terminated.
                            </p>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold">c. Counter-Notification</h3>
                            <p>
                                If you believe that content was removed or disabled in error, you
                                may submit a counter-notification containing the information
                                required by the DMCA:
                            </p>
                            <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                                <li>Your physical or electronic signature; A description of the content that has been
                                    removed and the location at which the content appeared before it was removed;
                                </li>
                                <li>A statement that you have a good faith belief that the content was removed as a
                                    result of mistake or a misidentification of the content; and
                                </li>
                            </ol>
                            <p className="mt-1">
                                Your name, address, telephone number, and email address, a statement that you consent to
                                the jurisdiction of the federal court in New Jersey and a statement that you will accept
                                service of process from the person who provided notification of the alleged
                                infringement. If a counter-notice is received by the Company copyright agent, the
                                Company may send a copy of the counter-notice to the original complaining party
                                informing such person that it may reinstate the removed content in 10 business days.
                                Unless the copyright owner files an action seeking a court order against the content
                                provider, member or user, the removed content may (in the Company’s discretion) be
                                reinstated on the Site in 10 to 14 business days or more after receipt of the
                                counter-notice.
                            </p>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold">d. No Legal Advice</h3>
                            <p>
                                The Service is not qualified to adjudicate copyright disputes and
                                relies on the DMCA notice and counter-notice process.
                            </p>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold">e. Company Intellectual Property</h3>
                            <p>
                                You acknowledge and agree that the Company and its licensors
                                retain ownership of all intellectual property rights of any kind
                                related to the Site or Service (except for User Content),
                                including applicable copyrights, trademarks, and other proprietary
                                rights. The Company reserves all rights that are not expressly
                                granted to you under these Terms.
                            </p>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold">f. Feedback</h3>
                            <p>
                                We welcome and encourage you to provide feedback, comments, and
                                suggestions for improvements of the Site or Service (“Feedback”).
                                You may submit Feedback by emailing us at <a href="mailto:feedback@allchat.org"
                                                                             className="text-blue-600 dark:text-blue-400 hover:underline">feedback@allchat.org</a>.
                                You acknowledge and agree that if you submit any Feedback to us, you hereby grant to us
                                a non-exclusive, worldwide, perpetual, irrevocable, fully-paid, royalty-free,
                                sub-licensable (through several tiers) and transferable license under any and all
                                intellectual property rights that you own or control in relation to the Feedback to use,
                                reproduce, view, communicate to the public by any means, print, copy, edit, translate,
                                perform and display (publicly or otherwise), distribute, redistribute, modify, adapt,
                                make, sell, offer to sell, transmit, license, transfer, stream, broadcast, create
                                derivative works from, and otherwise use and exploit the Feedback for any purpose.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            15. USER CONSENT TO RECEIVE COMMUNICATIONS IN ELECTRONIC FORM
                        </h2>
                        <p>
                            For contractual purposes, you (a) consent to receive emails via the
                            email address you have submitted when you sign up on the Site; and
                            (b) agree that all Terms, agreements, notices, disclosures, and
                            other communications that the Company provides to you electronically
                            satisfy any legal requirement that such communications would satisfy
                            if it were in writing. The foregoing does not affect your
                            non-waivable rights.
                        </p>
                        <p className="mt-2">
                            The Company may also use your email address to send you other
                            messages, including information about the Company and Site. You may
                            opt out of such email by clicking on the “unsubscribe” button on an
                            email.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">16. GENERAL TERMS</h2>
                        <p>
                            If any part of these Terms is held invalid or unenforceable, that
                            portion of the Terms will be construed consistent with applicable
                            law. The remaining portions will remain in full force and effect.
                            Any failure on the part of the Company to enforce any provision of
                            these Terms will not be considered a waiver of our right to enforce
                            such provision. Our rights under these Terms will survive any
                            termination of these Terms.
                        </p>
                        <p className="mt-2">
                            You agree that any legal action related to or arising out of your
                            relationship with the Company or use of the Service must commence
                            within ONE year after the cause of action accrues. Otherwise, such
                            cause of action is permanently barred.
                        </p>
                        <p className="mt-2">
                            These Terms and your use of the Site and Service are governed by the
                            federal laws of the United States of America and the laws of the
                            State of New Jersey without regard to conflict of law provisions.
                        </p>
                        <p className="mt-2">
                            You agree to resolve any claims relating to these Terms or the Site
                            or Service through final and binding arbitration. Any arbitration
                            will be conducted by the American Arbitration Association (AAA)
                            under its commercial arbitration rules. The arbitration will be held
                            in Cape May County, New Jersey.
                        </p>
                        <p className="mt-2 uppercase font-semibold">
                            ARBITRATION MUST BE ON AN INDIVIDUAL BASIS. THIS MEANS NEITHER YOU
                            NOR THE COMPANY MAY JOIN OR CONSOLIDATE CLAIMS IN ARBITRATION BY
                            OR AGAINST OTHER USERS OR LITIGATE IN COURT OR ARBITRATE ANY CLAIMS
                            AS A REPRESENTATIVE OR MEMBER OF A CLASS OR IN A PRIVATE ATTORNEY
                            GENERAL CAPACITY.
                        </p>
                        <p className="mt-2">
                            If you attempt to bring any legal action against the Company based
                            in any way on the Site or Service you agree that, in the event you
                            do not prevail or the Company does prevail, you will reimburse the
                            Company for any costs and attorneys’ fees associated with its
                            defense of the action.
                        </p>
                        <p className="mt-2">
                            The Company may assign or delegate these Terms and/or the Company’s
                            <button type="button"
                                    onClick={() => open(<div className="max-w-4xl"><PrivacyPolicy/></div>)}
                                    className="text-blue-600 dark:text-blue-400 hover:underline">Privacy
                                Policy</button>, in whole or in part, to any person or entity at any
                            time with or without your consent. You may not assign or delegate
                            any rights or obligations under the Terms or <button type="button" onClick={() => open(<div
                            className="max-w-4xl"><PrivacyPolicy/></div>)}
                                                                                 className="text-blue-600 dark:text-blue-400 hover:underline">Privacy
                            Policy</button> without
                            the Company’s prior written consent, and any unauthorized assignment
                            and delegation by you is void.
                        </p>

                        <div className="mt-4 border-t pt-4">
                            <h3 className="font-semibold uppercase mb-2">
                                NOTICE FOR CALIFORNIA USERS
                            </h3>
                            <p>
                                Under California Civil Code Section 1789.3, California users are
                                entitled to the following specific consumer rights notice: You may
                                contact us at <a href="mailto:legal@allchat.org"
                                                 className="text-blue-600 dark:text-blue-400 hover:underline">legal@allchat.org</a>.
                                The Complaint
                                Assistance Unit of the Division of Consumer Services of the
                                California Department of Consumer Affairs may be contacted in
                                writing at 1625 N. Market Blvd., Suite S-202, Sacramento,
                                California 95834, or by telephone at (800) 952-5210.
                            </p>
                        </div>

                        <div className="mt-6 border-t pt-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <h3 className="font-bold uppercase text-center mb-2">
                                YOUR AGREEMENT
                            </h3>
                            <p className="text-center font-semibold uppercase">
                                YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS, UNDERSTAND THE
                                TERMS, AND WILL BE BOUND BY THESE TERMS. YOU FURTHER ACKNOWLEDGE
                                THAT THESE TERMS TOGETHER WITH THE <button type="button" onClick={() => open(<div
                                className="max-w-4xl"><PrivacyPolicy/></div>)}
                                                                           className="text-blue-600 dark:text-blue-400 hover:underline font-bold uppercase">PRIVACY
                                POLICY</button> REPRESENT THE
                                COMPLETE AND EXCLUSIVE STATEMENT OF THE AGREEMENT BETWEEN US AND
                                THAT IT SUPERSEDES ANY PROPOSAL OR PRIOR AGREEMENT ORAL OR
                                WRITTEN, AND ANY OTHER COMMUNICATIONS BETWEEN US RELATING TO THE
                                SUBJECT MATTER OF THIS AGREEMENT.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">17. Contact</h2>
                        <p>
                            If you have questions about these Terms, please contact us at <a
                            href="mailto:legal@allchat.org"
                            className="text-blue-600 dark:text-blue-400 hover:underline">legal@allchat.org</a>.
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
