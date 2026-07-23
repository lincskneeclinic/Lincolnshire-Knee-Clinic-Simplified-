import React from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";

export default function CookiePolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Cookie Policy" }]} />

      {/* Draft Warning Banner */}
      <div className="bg-status-warning-bg border border-status-warning/20 text-status-warning p-4 rounded-xl my-6 text-sm">
        <span className="font-bold">Draft Content Notice:</span> This is a draft template document. It requires thorough clinical, administrative, and legal review before public publication.
      </div>

      <PageHeader
        category="Legal & Privacy"
        title="Cookie Policy"
        subtitle="Information about how our platform uses cookies to improve patient navigation and experience."
      />

      <div className="space-y-6 text-sm md:text-base text-text-secondary leading-relaxed">
        <p>
          This Cookie Policy explains how <strong>Lincolnshire Knee Clinic</strong> uses cookies and similar technologies 
          to recognize you when you visit our website. It explains what these technologies are and why we use them, 
          as well as your rights to control our use of them.
        </p>

        <h2 className="font-serif text-xl font-bold text-deep-navy mt-8 mb-3">
          1. What Are Cookies?
        </h2>
        <p>
          Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
          Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, 
          as well as to provide reporting information.
        </p>

        <h2 className="font-serif text-xl font-bold text-deep-navy mt-8 mb-3">
          2. Why We Use Cookies
        </h2>
        <p>
          We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons 
          in order for our website to operate, and we refer to these as &quot;essential&quot; or &quot;strictly necessary&quot; cookies. 
          Other cookies enable us to track and target the interests of our users to enhance the experience on our website.
        </p>

        <h2 className="font-serif text-xl font-bold text-deep-navy mt-8 mb-3">
          3. Types of Cookies We Use
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Essential Cookies:</strong> Required to enable core site functionality, such as securing forms, 
            coordinating scheduling requests, and managing navigation. The website cannot function properly without these.
          </li>
          <li>
            <strong>Performance/Analytics Cookies:</strong> Help us understand how visitors interact with the public pages 
            by collecting anonymous usage statistics.
          </li>
        </ul>

        <h2 className="font-serif text-xl font-bold text-deep-navy mt-8 mb-3">
          4. Controlling Cookies
        </h2>
        <p>
          You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls 
          to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access 
          to some functionality and areas may be restricted (for example, online appointment booking schedules).
        </p>
      </div>
    </div>
  );
}
