"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export default function PrivacyPolicy() {
    return (
        <div className="w-[85vw] md:w-[600px] max-h-[80vh] overflow-y-auto p-2 space-y-5">
            <Card className="border-0 shadow-none">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center mb-2">
                        Data Protection and Privacy Policy
                    </CardTitle>
                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                        Last Updated: February 6, 2026
                    </p>
                </CardHeader>
                <CardContent className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <section>
                        <p className="mb-4">
                            This Data Protection and Privacy Policy explains how we collect,
                            use, disclose, and protect information when you use our website at
                            allchat.org (the “Site”) and related services (collectively, the
                            “Service”). By using our Service, you consent to our Data
                            Protection and Privacy Policy. If you don’t agree, please don’t
                            use our Site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">Definitions</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Company</h3>
                                <p>
                                    “Company” means allchat LLC [ 8 The Green STE D, Dover, DE
                                    19901].
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold">GDPR</h3>
                                <p>
                                    “GDPR” means the General Data Protection Regulation Act. (This
                                    is a law that applies in the European Economic Area (EEA).)
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Data Controller</h3>
                                <p>
                                    “Data Controller” means the natural or legal person who (either
                                    alone or jointly or in common with other persons) determines the
                                    purposes for which and the manner in which any personal
                                    information are, or are to be, processed. The Company is the
                                    Data Controller for the personal data you submit via the Site.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Data Processor</h3>
                                <p>
                                    “Data Processor” means any natural or legal person who processes
                                    the data on behalf of the Data Controller.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Data Subject</h3>
                                <p>Data Subject is any living individual who is using our Site.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            Principles for Processing Personal Data
                        </h2>
                        <p className="mb-2">
                            Our principles for processing personal data under the GDPR are:
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-2">
                            <li>
                                <span className="font-semibold">Fairness and lawfulness.</span>{" "}
                                When we process personal data, the individual rights of the Data
                                Subjects must be protected. All personal data must be collected
                                and processed in a legal and fair manner.
                            </li>
                            <li>
                                <span className="font-semibold">
                                    Restricted to a specific purpose.
                                </span>{" "}
                                The personal data of Data Subject must be processed only for
                                specific purposes.
                            </li>
                            <li>
                                <span className="font-semibold">Transparency.</span> The Data
                                Subject must be informed of how his/her data is being collected,
                                processed and used.
                            </li>
                            <li>
                                <span className="font-semibold">Accuracy.</span> We take
                                reasonable steps to ensure that personal data will be accurate,
                                and that any mistakes are rectified or erased without delay.
                            </li>
                            <li>
                                <span className="font-semibold">Storage Limitation.</span> We will
                                not keep personal data for longer than we need it. (However, we
                                may keep anonymized data for an indefinite term.)
                            </li>
                        </ul>
                        <p className="mt-2">
                            <span className="font-semibold">
                                Confidentiality and Integrity.
                            </span>{" "}
                            We use appropriate measures to maintain the confidentiality and
                            integrity of personal data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            1. Information We Collect
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">a. Information You Provide</h3>
                                <p>We may collect information you voluntarily provide, such as:</p>
                                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                    <li>Username or display name</li>
                                    <li>Email address</li>
                                    <li>Phone number</li>
                                    <li>Messages, posts, or other content you submit</li>
                                    <li>Communications you send to us (e.g., support inquiries)</li>
                                </ul>
                                <p className="mt-1">
                                    You are responsible for the information you choose to post
                                    and/or share through the Service.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    b. Information Collected Automatically
                                </h3>
                                <p>
                                    When you use the Service, we may automatically collect certain
                                    technical and usage information about you, including:
                                </p>
                                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                    <li>IP address</li>
                                    <li>Device type and browser</li>
                                    <li>Operating system</li>
                                    <li>Pages viewed and interactions with the Service</li>
                                    <li>Date and time of access</li>
                                    <li>Approximate location (e.g., country or region)</li>
                                </ul>
                                <p className="mt-1">
                                    This information helps us operate, secure, and improve the
                                    Service.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    c. Cookies and Similar Technologies
                                </h3>
                                <p>We may use cookies or similar technologies to:</p>
                                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                    <li>Maintain sessions</li>
                                    <li>Remember preferences</li>
                                    <li>Analyze usage patterns</li>
                                </ul>
                                <p className="mt-1">
                                    You can control cookies through your browser settings, but some
                                    features may not function properly if cookies are disabled.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    d. Identity Verification Information (Optional)
                                </h3>
                                <p>
                                    In limited circumstances, such as account reinstatement
                                    following an age-based restriction, we may allow users to
                                    voluntarily submit government-issued identification solely to
                                    verify that they meet the minimum age requirement for the
                                    Service.
                                </p>
                                <p className="mt-1">
                                    This information is reviewed manually and used only for age
                                    verification purposes.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            2. How We Use Information
                        </h2>
                        <p>We use collected information to:</p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Provide, operate, and maintain the Service</li>
                            <li>Enable communication between users</li>
                            <li>Improve functionality, performance, and user experience</li>
                            <li>Respond to inquiries and support requests</li>
                            <li>Enforce our Terms of Service</li>
                            <li>Verify your identity to prove you’re over 18</li>
                            <li>Charge you for advertising if you choose to advertise on the Site</li>
                            <li>Notify you about changes to our Site and Services</li>
                            <li>Send you technical notices</li>
                            <li>Detect, prevent, and address technical problems, abuse, fraud, security issues, or
                                illegal activity
                            </li>
                            <li>Comply with legal obligations</li>
                            <li>To verify eligibility requirements, including minimum age, when requested by the user
                            </li>
                        </ul>
                        <p className="mt-2">
                            We do not use personal information for purposes unrelated to operating and improving the
                            Service. Your information may be stored in our own servers or in servers owned by
                            third-party cloud storage providers.
                        </p>

                        <div className="mt-4 border-t pt-4">
                            <h3 className="font-semibold mb-2">
                                Legal Basis for Collecting and Processing Personal Data
                            </h3>
                            <p>
                                Our legal basis for collecting and using the personal data
                                described in this Policy depends on the personal data we collect
                                and the specific context in which we collect the information:
                            </p>
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                <li>We need to perform a contract with you.</li>
                                <li>You have given us permission to do so.</li>
                                <li>Processing your personal data is in our legitimate interests.</li>
                                <li>We need to comply with the law.</li>
                            </ul>
                            <p className="mt-2">
                                Please be aware that if you do not provide personal data we may be
                                unable to provide some Services to you.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            3. User-Generated Content and Public Information
                        </h2>
                        <p>
                            Some information you share, such as messages or posts in public
                            chatrooms, may be visible to other users and, depending on settings,
                            the public.
                        </p>
                        <p className="mt-2">Please be aware that:</p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Content you share publicly may be copied, stored, or shared by others.</li>
                            <li>We cannot control how third parties use public information.</li>
                            <li>You should avoid sharing sensitive personal information in public areas.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            4. Data Sharing and Disclosure
                        </h2>
                        <p>We do not sell your personal information.</p>
                        <p className="mt-2">We may share information:</p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>With service providers who assist us in operating the Service (e.g., hosting, analytics,
                                security)
                            </li>
                            <li>To comply with legal obligations, lawful requests, subpoenas, or court orders</li>
                            <li>To protect the rights, safety, and property of the Service, our users, or the public
                            </li>
                            <li>In connection with a merger, acquisition, or sale of our assets</li>
                        </ul>
                        <p className="mt-2">
                            We may also disclose information when we reasonably believe it is
                            necessary to investigate or prevent harmful or illegal activity.
                        </p>
                        <p className="mt-2">
                            We may transfer to, and store the data we collect about you in,
                            countries other than the country in which the data was originally
                            collected, including the United States, Canada or other destinations
                            outside the European Economic Area (“EEA”). Those countries may not
                            have the same data protection laws as the country in which you
                            provided the data. When we transfer your data to other countries, we
                            will protect the data as described in this Policy and comply with
                            applicable legal requirements providing adequate protection for the
                            transfer of data to countries outside the EEA.
                        </p>
                        <p className="mt-2">
                            If you are located in the EEA, we will only transfer your personal
                            data if:
                        </p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>the country to which the personal data will be transferred has been granted a European
                                Commission adequacy decision;
                            </li>
                            <li>the recipient of the personal data is located in the US and has certified to the US-EU
                                Privacy Shield Framework; or
                            </li>
                            <li>we have put in place appropriate safeguards in respect of the transfer, for example we
                                have entered into EU standard contractual clauses with the recipient, or the recipient
                                is a party to binding corporate rules.
                            </li>
                        </ul>
                        <p className="mt-2">
                            You may request more information about the safeguards that we have
                            put in place in respect of transfers of personal data by contacting{" "}
                            <a href="mailto:legal@allchat.org"
                               className="text-blue-600 dark:text-blue-400 hover:underline">
                                legal@allchat.org
                            </a>
                            .
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            5. Legal Compliance and Safety
                        </h2>
                        <p>
                            We may preserve and disclose information, including user content and
                            account data, if required by law or if we reasonably believe such
                            action is necessary to:
                        </p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Comply with legal obligations</li>
                            <li>Respond to lawful requests from authorities</li>
                            <li>Enforce our policies</li>
                            <li>Protect users or the public from harm</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">6. Data Retention</h2>
                        <p>
                            We will retain your information and User Content for as long as
                            reasonably necessary to:
                        </p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Provide the Service</li>
                            <li>Fulfill the purposes outlined in this Policy</li>
                            <li>Comply with legal obligations</li>
                            <li>Resolve disputes</li>
                            <li>Enforce agreements and our policies</li>
                        </ul>
                        <p className="mt-2">
                            Identity verification documents, if submitted, are retained only for
                            as long as reasonably necessary to complete verification and are
                            deleted promptly thereafter, unless retention is required by law.
                        </p>
                        <p className="mt-2">
                            We intend to store some of your information indefinitely, to the
                            extent allowed by law. Retention periods may vary depending on the
                            type of data and applicable legal requirements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">7. Data Security</h2>
                        <p>
                            We implement reasonable administrative, technical, and
                            organizational measures to protect information. However, no method
                            of transmission or storage is completely secure, and we cannot
                            guarantee absolute security.
                        </p>
                        <p className="mt-2">
                            You are responsible for maintaining the confidentiality of your
                            account credentials.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            8. Third-Party Services
                        </h2>
                        <p>
                            The Service may contain links to third-party websites or services.
                            We are not responsible for the privacy practices or content of third
                            parties. Your interactions with third-party services are governed by
                            their own privacy policies.
                        </p>

                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Sub-processors</h3>
                            <p>
                                The Company works with certain third parties to provide specific
                                functionality within the Site. By using the Site, you also
                                authorize the engagement of these third parties as sub-processors
                                of your data. If you object to the sub-processors’ handling of
                                your data on the terms indicated at the links, please terminate
                                your use of the Site.
                            </p>

                            <div className="mt-4 overflow-x-auto">
                                <table
                                    className="min-w-full text-sm text-left border-collapse border border-gray-200 dark:border-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium">Product
                                            Name
                                        </th>
                                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium">Company
                                            Name
                                        </th>
                                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium">Company
                                            Location
                                        </th>
                                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium">Company
                                            role and function
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Incognet</td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                                            <a href="https://incognet.io/privacy" target="_blank"
                                               rel="noopener noreferrer"
                                               className="text-blue-600 dark:text-blue-400 hover:underline">https://incognet.io/privacy</a>
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">United
                                            States
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Web
                                            hosting and server infrastructure provider that stores and delivers websites
                                            and related data.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Epik</td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                                            <a href="https://www.epik.com/privacy/" target="_blank"
                                               rel="noopener noreferrer"
                                               className="text-blue-600 dark:text-blue-400 hover:underline">https://www.epik.com/privacy/</a>
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">United
                                            States
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Domain
                                            registrar and DNS services provider used to register and manage our website
                                            domain names.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Twilio</td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                                            <a href="https://www.twilio.com/en-us/legal/privacy" target="_blank"
                                               rel="noopener noreferrer"
                                               className="text-blue-600 dark:text-blue-400 hover:underline">https://www.twilio.com/en-us/legal/privacy</a>
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">United
                                            States
                                        </td>
                                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Phone
                                            number verification and SMS delivery provider used to confirm user
                                            identities and send security-related messages.
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-4">
                                You may contact these sub-processors directly to have any
                                information they store about you erased. We may update our list of
                                sub-processors by posting that information in this privacy policy.
                                Please check back for updates.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            9. Age Restriction and Children’s Privacy
                        </h2>
                        <p>
                            The Service is strictly intended for individuals who are at least 18
                            years of age. Use of the Service by anyone under 18 is prohibited.
                        </p>
                        <p className="mt-2">
                            We do not knowingly collect personal information from individuals
                            under 18. If we become aware that a user is under 18 or that
                            personal information has been collected from an individual under 18,
                            we will take appropriate steps to remove such information and
                            terminate the account.
                        </p>
                        <p className="mt-2">
                            If you believe that an individual under 18 has provided personal
                            information through the Service, please contact us so we can take
                            appropriate action.
                        </p>
                        <p className="mt-2">
                            If you are under the age of 18, and if our Site publicly displays
                            your User Content, at any time you can delete or remove your content
                            using the deletion or removal method within our Site. If you have
                            questions about how to remove your content, or you need assistance,
                            you can contact us at{" "}
                            <a href="mailto:legal@allchat.org"
                               className="text-blue-600 dark:text-blue-400 hover:underline">
                                legal@allchat.org
                            </a>
                            .
                        </p>
                        <p className="mt-2">
                            Although we offer deletion capability, you should be aware that your
                            removal of your content may not ensure complete or comprehensive
                            remove the content or information posted through the App, especially
                            if it has been shared by others. Also, there may be circumstances in
                            which the law does not require or allow removal even if requested.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            10. Identity Verification and Sensitive Information
                        </h2>
                        <p>
                            Any government-issued identification submitted for age verification
                            is handled with heightened confidentiality, accessed only by
                            authorized personnel, and used solely for the purpose of determining
                            eligibility to use the Service.
                        </p>
                        <p className="mt-2">
                            We do not use identity documents for tracking, profiling,
                            advertising, or any unrelated purpose.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">11. Your Choices</h2>
                        <p>
                            Depending on your jurisdiction, you may have certain rights
                            regarding your personal information, such as requesting access,
                            correction, or deletion. Requests may be subject to legal and
                            operational limitations.
                        </p>

                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Data Protection Rights</h3>
                            <p>
                                If you are a resident of the European Economic Area (EEA), you
                                have certain data protection rights. If you wish to be informed
                                what personal data we hold about you and if you want it to be
                                removed from our systems, please contact us at{" "}
                                <a href="mailto:legal@allchat.org"
                                   className="text-blue-600 dark:text-blue-400 hover:underline">legal@allchat.org</a>.
                            </p>
                            <p className="mt-2">
                                In certain circumstances, you have the following data protection rights:
                            </p>
                            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                <li>The right to be informed of your rights</li>
                                <li>The right to access, update or to delete the information we have on you</li>
                                <li>The right of rectification (to correct mistakes)</li>
                                <li>The right to erasure (known as “the right to be forgotten”)</li>
                                <li>The right to restrict processing of your data</li>
                                <li>The right to data portability</li>
                                <li>The right to withdraw consent</li>
                            </ul>
                            <p className="mt-2">
                                If you are resident in the European Economic Area and you believe
                                we are unlawfully processing your personal information, you also
                                have the right to complain to your local data protection
                                supervisory authority. You can find their contact details here:{" "}
                                <a href="http://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm"
                                   target="_blank" rel="noopener noreferrer"
                                   className="text-blue-600 dark:text-blue-400 hover:underline">
                                    http://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm
                                </a>
                                .
                            </p>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Withdrawing Consent</h3>
                            <p>
                                If you wish to withdraw your consent to process your personal
                                data, please contact us at{" "}
                                <a href="mailto:legal@allchat.org"
                                   className="text-blue-600 dark:text-blue-400 hover:underline">legal@allchat.org</a>.
                                If you withdraw your
                                consent, this will not make processing which we undertook before
                                you withdrew your consent unlawful.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            12. Changes to This Privacy Policy
                        </h2>
                        <p>
                            We may update this Privacy Policy from time to time. The updated
                            version will be posted with a revised “Last Updated” date. Continued
                            use of the Service after changes indicates acceptance of the updated
                            Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">13. Contact Us</h2>
                        <p>
                            If you have questions about this Privacy Policy, please contact us
                            at <a href="mailto:legal@allchat.org"
                                  className="text-blue-600 dark:text-blue-400 hover:underline">
                            legal@allchat.org
                        </a>
                            .
                        </p>
                    </section>

                    <section className="border-t pt-4">
                        <h2 className="text-xl font-semibold mb-4">
                            Collection and Use of Personal Information
                        </h2>
                        <p className="mb-2">
                            We collect various categories of personal information in connection
                            with our services. Please review the rest of our Privacy Policy to
                            learn more about the personal information we collect.
                        </p>
                        <p className="mb-2">
                            In the last 12 months we have collected the following categories of
                            personal information:
                        </p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
                            <li>
                                <span className="font-semibold">Identifiers</span>, such as name,
                                address, email address, phone number, account information or other
                                similar identifiers. These are collected directly from you, our
                                business partners and affiliates, your browser or device and third
                                parties you direct to share information with us.
                            </li>
                            <li>
                                <span className="font-semibold">
                                    Internet/Network Information
                                </span>
                                , such as log data and analytics data (including your usage and
                                activity on our website). These are collected from your browser or
                                device.
                            </li>
                            <li>
                                <span className="font-semibold">Geolocation Data</span>, such as
                                your general geographic location based on the log data. These are
                                collected from your browser or device.
                            </li>
                            <li>
                                <span className="font-semibold">
                                    Other Personal Information
                                </span>
                                , such as messages or requests you provide to us directly or
                                through a third-party service, such as social media. These are
                                collected directly from you, our business partners and affiliates,
                                and third parties you direct to share information with us.
                            </li>
                            <li>
                                <span className="font-semibold">Inferences</span>, including
                                information generated from your use of our websites reflecting
                                your preferences. These are collected from your browser device,
                                and form information generated or derived from the personal
                                information described above.
                            </li>
                        </ul>

                        <p className="mt-4 mb-2">
                            The business purpose for the information collected as above is as follows:
                        </p>
                        <ol className="list-decimal list-inside ml-4 space-y-1">
                            <li>To provide you with and manage access to our products and services, audit the
                                transactions in our platform and manage the relationship with our users;
                            </li>
                            <li>To communicate with you, including via email, push notification and/or social media;
                            </li>
                            <li>To operate, evaluate, secure and improve our business;</li>
                            <li>To enhance our products and services;</li>
                            <li>To recognize you and remember your information when you return to our website and
                                services;
                            </li>
                            <li>To develop and carry out marketing campaigns and activities;</li>
                            <li>For debugging existing intended functionality;</li>
                            <li>For testing, training, research, analysis and product development, including to develop
                                and improve our products and services;
                            </li>
                            <li>To detect and protect against security events;</li>
                            <li>To defend, protect or enforce our rights or applicable terms of service;</li>
                            <li>To comply with legal process and our legal obligations; and</li>
                            <li>As otherwise provided in our agreements with you.</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            Disclosure of Personal Information
                        </h2>
                        <p>
                            In the last 12 months, we have not sold personal information about
                            you, but we have disclosed all of the categories of personal
                            information we collect, explained in the table above, to our
                            affiliate and to third parties for a business purpose.
                        </p>
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">
                                Recipients of Personal Information
                            </h3>
                            <p>
                                As described above, we share personal information with a variety
                                of third parties for business purposes.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            Your California Privacy Rights
                        </h2>
                        <p>
                            As a California resident, you may be able to exercise the following
                            rights in relation to the Personal Information about you that we
                            have collected (subject to certain limitations at law):
                        </p>

                        <div className="mt-4 space-y-4">
                            <div>
                                <h3 className="font-semibold mb-1">The Right to Know</h3>
                                <p>
                                    You have the right to request any or all of the following
                                    information relating to the personal information we have
                                    collected about you or disclosed in the last 12 months, upon
                                    verification of your identity:
                                </p>
                                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                    <li>The specific pieces of personal information we have collected about you;</li>
                                    <li>The categories of personal information we have collected about you;</li>
                                    <li>The categories of sources of the personal information we have collected about
                                        you;
                                    </li>
                                    <li>The categories of personal information that we have disclosed about you to third
                                        parties for a business purpose, and the categories of recipients to whom this
                                        information was disclosed;
                                    </li>
                                    <li>The categories of personal information we have sold about you (if any), and the
                                        categories of third parties to whom this information was sold; and
                                    </li>
                                    <li>The business or commercial purposes for collecting or, if applicable, selling
                                        personal information about you.
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-1">
                                    The Right to Request Deletion
                                </h3>
                                <p>
                                    You have the right to request the deletion of personal
                                    information that we have collected from you, subject to certain
                                    exceptions.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-1">
                                    The Right to Opt Out of Personal Information Sales
                                </h3>
                                <p>
                                    You have the right to direct us not to sell personal information
                                    we have collected about you to third parties now or in the
                                    future. If you are under the age of 16, you have the right to
                                    opt in, or to have a parent or guardian opt in on your behalf,
                                    to such sales.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-1">
                                    The Right to Non-Discrimination
                                </h3>
                                <p>
                                    You have the right not to receive discriminatory treatment for
                                    exercising any of the rights described above. However, please
                                    note that if the exercise of the rights described above limits
                                    our ability to process personal information (such as in the case
                                    of a deletion request), we may no longer be able to provide you
                                    our products or services or engage with you in the same manner.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="border-t pt-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h2 className="text-xl font-bold uppercase text-center mb-2">
                            Contact Us
                        </h2>
                        <p className="text-center">
                            If you have questions about our Privacy Policy, please contact us at{" "}
                            <a href="mailto:legal@allchat.org"
                               className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                                legal@allchat.org
                            </a>
                            .
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
