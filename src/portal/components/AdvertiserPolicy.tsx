"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@ads/components/ui/card";

export default function AdvertiserPolicy() {
    return (
        <div className="w-[85vw] md:w-[600px] max-h-[80vh] overflow-y-auto p-2 space-y-5">
            <Card className="border-0 shadow-none">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center mb-2">
                        Advertiser Terms
                    </CardTitle>
                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                        Last Updated: February 6, 2026
                    </p>
                </CardHeader>
                <CardContent className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                        These Advertiser Terms (&ldquo;Advertiser Terms&rdquo;) govern the purchase and display of
                        advertising on the allchat platform &ldquo;allchat.org&rdquo; (the &ldquo;Service&rdquo;)
                        operated by allchat LLC (the &ldquo;Company&rdquo;). By purchasing advertising through the
                        Service, you (&ldquo;you&rdquo; or &ldquo;Advertiser&rdquo;) agree to be bound by these
                        Advertiser Terms, the general Terms of Service, and any applicable payment processor terms.
                    </p>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">1. Advertising Format and Placement</h2>
                        <p>
                            Advertisements on the Service are displayed as in-chat promotional messages, visually
                            distinct from user-generated messages and labeled as &ldquo;Advertisement.&rdquo; Ads may
                            include a title and text, image, or video content, depending on the selected format.
                        </p>
                        <p className="mt-2">
                            Ads are shown to users no more than once per hour and are displayed within chatrooms
                            alongside other messages.
                        </p>
                        <p className="mt-2">
                            Placement, timing, and frequency are determined by the Company at its sole discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">2. Impression-Based Pricing</h2>
                        <p>Advertising is sold on an impression-only basis.</p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Advertisers purchase advertising in blocks of 1,000 impressions</li>
                            <li>Pricing varies based on ad format and length</li>
                            <li>Text ads are priced based on character length</li>
                            <li>Image and video ads are priced separately and may cost more than text ads</li>
                        </ul>
                        <p className="mt-2">
                            No clicks, conversions, or engagement are guaranteed. Advertisers acknowledge that
                            impressions reflect ad display only, not user interaction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">3. No Guarantee of Performance</h2>
                        <p>The Company makes no guarantees regarding:</p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Click-through rates</li>
                            <li>Conversions</li>
                            <li>Sales</li>
                            <li>User engagement</li>
                            <li>Advertising effectiveness</li>
                        </ul>
                        <p className="mt-2">
                            All advertising is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
                            Advertisers assume all risk associated with campaign performance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            4. Editorial Independence and Platform Speech
                        </h2>
                        <p>The Company maintains full editorial independence.</p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>The Company does not endorse advertised products or services</li>
                            <li>Advertising does not imply approval, sponsorship, or recommendation</li>
                            <li>
                                The Company may express general opinions about advertising, monetization, or platform
                                funding models
                            </li>
                            <li>
                                The Company is not obligated to promote, encourage, or favor advertiser content beyond
                                displaying purchased impressions
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">5. Advertiser Responsibilities</h2>
                        <p>Advertisers represent and warrant that all advertising content:</p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Is legal in all applicable jurisdictions</li>
                            <li>Is safe for work</li>
                            <li>Does not contain misleading, deceptive, or fraudulent claims</li>
                            <li>Does not infringe intellectual property, privacy, or publicity rights</li>
                            <li>Is not defamatory or obscene</li>
                            <li>Does not contain or link to malware</li>
                            <li>
                                Does not promote illegal products or services, cryptocurrency, gambling, adult content
                                or activity, violence, or exploitation
                            </li>
                        </ul>
                        <p className="mt-2">
                            Advertisers are solely responsible for the accuracy and legality of their advertising
                            content. Advertisers are responsible for landing page user experience and for honoring any
                            offers or claims in ads.
                        </p>
                        <p className="mt-2">
                            Advertisers grant Company a non-exclusive, worldwide, royalty-free license to use,
                            reproduce, display and perform Advertiser&rsquo;s trademarks, logos and advertising
                            content solely to deliver the advertising content.
                        </p>
                        <p className="mt-2">
                            Advertisers may not track minors or use of sensitive personal data without explicit user
                            consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">6. Ad Review, Rejection, and Removal</h2>
                        <p>
                            The Company reserves the right, but does not assume the obligation, to review advertising
                            content.
                        </p>
                        <p className="mt-2">The Company may:</p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Reject ads prior to display</li>
                            <li>Remove ads at any time</li>
                            <li>Suspend or terminate advertising campaigns</li>
                        </ul>
                        <p className="mt-2">Reasons may include, but are not limited to:</p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Violation of these Advertiser Terms</li>
                            <li>Violation of law</li>
                            <li>Risk to users or the platform</li>
                            <li>Technical or operational concerns</li>
                        </ul>
                        <p className="mt-2">
                            The Company is not required to provide justification for ad rejection or removal.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">7. Payments and Billing</h2>
                        <p>
                            All advertising payments are processed via Stripe or another third-party payment
                            processor.
                        </p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Advertisers must provide valid payment information</li>
                            <li>Charges are made per purchased impression block, in advance</li>
                            <li>
                                Advertisers agree to the payment processor&rsquo;s terms and policies
                            </li>
                        </ul>
                        <p className="mt-2">
                            Except where required by law, advertising purchases are non-refundable, including unused
                            impressions resulting from campaign termination.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">8. Taxes</h2>
                        <p>
                            Advertisers are responsible for any applicable taxes, duties, or fees associated with
                            advertising purchases, excluding taxes imposed on the Company&rsquo;s income.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">9. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, the Company shall not be liable for any indirect,
                            incidental, consequential, special, or punitive damages arising from or related to
                            advertising via the Service.
                        </p>
                        <p className="mt-2">
                            The Company&rsquo;s total liability for any claim shall not exceed the total amount paid
                            by the Advertiser for the applicable advertising campaign in the three (3) months before
                            the claim arose.
                        </p>
                        <p className="mt-2 uppercase font-semibold">
                            SOME JURISDICTIONS LIMIT OR DO NOT PERMIT DISCLAIMERS OF LIABILITY, SO THIS PROVISION MAY
                            NOT APPLY TO YOU.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">10. Indemnification</h2>
                        <p>
                            Advertiser agrees to indemnify, defend, and hold harmless the Company, its owners,
                            operators, and affiliates from any claims, liabilities, damages, losses, and expenses
                            arising out of or related to:
                        </p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Advertiser&rsquo;s content</li>
                            <li>Advertiser&rsquo;s products or services</li>
                            <li>Alleged violations of law</li>
                            <li>Alleged infringement of third-party rights</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">11. Suspension or Termination</h2>
                        <p>
                            The Company may suspend or terminate Advertisers&rsquo; advertising access at any time,
                            with or without notice, for violation of these Advertiser Terms or for any lawful reason.
                        </p>
                        <p className="mt-2">
                            Termination does not entitle the Advertiser to refunds unless required by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">12. Modifications to Advertiser Terms</h2>
                        <p>
                            The Company may update these Advertiser Terms from time to time. Updated terms will be
                            posted with a revised &ldquo;Last Updated&rdquo; date. Continued purchase of advertising
                            after changes constitutes acceptance of the revised terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">13. Governing Law</h2>
                        <p>
                            If any part of these Advertiser Terms is held invalid or unenforceable, that portion of
                            the Advertiser Terms will be construed consistent with applicable law. The remaining
                            portions will remain in full force and effect. Any failure on the part of the Company to
                            enforce any provision of these Advertiser Terms will not be considered a waiver of our
                            right to enforce such provision. Our rights under these Advertiser Terms will survive any
                            termination of these Advertiser Terms.
                        </p>
                        <p className="mt-2">
                            You agree that any legal action related to or arising out of your relationship with the
                            Company or use of the Service must commence within ONE year after the cause of action
                            accrues. Otherwise, such cause of action is permanently barred.
                        </p>
                        <p className="mt-2">
                            These Advertiser Terms and any disputes related to them or your advertising with the
                            Company are governed by the federal laws of the United States of America and the laws of
                            the State of New Jersey without regard to conflict of law provisions.
                        </p>
                        <p className="mt-2">
                            You agree to resolve any claims relating to these Advertiser Terms or the Service through
                            final and binding arbitration. Any arbitration will be conducted by the American
                            Arbitration Association (AAA) under its commercial arbitration rules. The arbitration will
                            be held in Cape May County, New Jersey.
                        </p>
                        <p className="mt-2 uppercase font-semibold">
                            ARBITRATION MUST BE ON AN INDIVIDUAL BASIS. THIS MEANS NEITHER YOU NOR THE COMPANY MAY
                            JOIN OR CONSOLIDATE CLAIMS IN ARBITRATION BY OR AGAINST OTHER USERS OR LITIGATE IN COURT
                            OR ARBITRATE ANY CLAIMS AS A REPRESENTATIVE OR MEMBER OF A CLASS OR IN A PRIVATE ATTORNEY
                            GENERAL CAPACITY.
                        </p>
                        <p className="mt-2">
                            If you attempt to bring any legal action against the Company based in any way on the
                            Service you agree that, in the event you do not prevail or the Company does prevail, you
                            will reimburse the Company for any costs and attorneys&rsquo; fees associated with its
                            defense of the action.
                        </p>
                        <p className="mt-2">
                            The Company may assign or delegate these Advertiser Terms in whole or in part, to any
                            person or entity at any time with or without your consent. You may not assign or delegate
                            any rights or obligations under the Advertiser Terms without the Company&rsquo;s prior
                            written consent, and any unauthorized assignment and delegation by you is void.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">14. Contact</h2>
                        <p>
                            Questions regarding advertising may be directed to{" "}
                            <a href="mailto:legal@allchat.org"
                               className="text-blue-600 dark:text-blue-400 hover:underline">legal@allchat.org</a>.
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
