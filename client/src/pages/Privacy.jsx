import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../utils/usePageTitle.js';
import { ShieldAlert, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

export const Privacy = () => {
  usePageTitle('Privacy Policy (Draft)');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back navigation */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </Link>
      </div>

      {/* Prominent Legal Review Notice */}
      <div
        className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1.5"
        role="alert"
      >
        <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-700" aria-hidden="true" />
          <span>[DRAFT - PENDING FORMAL LEGAL REVIEW BEFORE COMMUNITY DEPLOYMENT]</span>
        </div>
        <p className="text-amber-900/90 leading-relaxed">
          Notice: This draft policy outlines internal operational data handling for college project demonstration purposes. Prior to deployment in an active community hub, this text must be formally reviewed and approved by a qualified data protection legal advisor under the Data Protection Act 2018 / UK GDPR.
        </p>
      </div>

      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#1C1B19]">
          Privacy Policy (Volunteer Data Notice)
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Last revised: 17 November 2026. Version: 1.0-draft.
        </p>
      </div>

      {/* Policy Content */}
      <div className="prose prose-stone text-xs text-stone-700 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            1. Scope and Purpose
          </h2>
          <p>
            The Community Fridge Log application is an internal operations portal used exclusively by authorised volunteers and coordinators to record food stock, monitor use-by dates, and log collections and disposals. It is not open to public registration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            2. Personal Data Collected
          </h2>
          <p>
            When an administrator registers a volunteer account, the following operational details are stored:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Full Name:</strong> To identify volunteers who log food donations, collections, and disposals.</li>
            <li><strong>Email Address:</strong> Used as the unique login credential and for essential operational notices.</li>
            <li><strong>Telephone Number (Optional):</strong> For direct contact in urgent fridge maintenance or safety situations.</li>
            <li><strong>Role and Account Status:</strong> Indicating volunteer or administrator permissions and active status.</li>
            <li><strong>Audit Logs:</strong> Records of which volunteer executed each stock intake, collection, or disposal action.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            3. Security and Storage
          </h2>
          <p>
            Passwords are encrypted using bcrypt salted hashes. Authentication sessions use JSON Web Tokens (JWT). We do not store plaintext passwords. Access to volunteer contact lists is restricted strictly to administrators.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            4. Data Retention and Deactivation
          </h2>
          <p>
            Volunteer accounts remain stored while active. When a volunteer departs, an administrator can deactivate their account, preventing further access while preserving historical audit integrity for food safety records.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            5. Third Parties and Advertising
          </h2>
          <p>
            We do not sell, rent, or share personal data with advertisers or commercial data brokers. No third-party tracking scripts, analytics cookies, or marketing trackers are used on this site.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            6. Contact for Queries
          </h2>
          <p>
            For questions concerning volunteer records or data corrections, contact your community fridge administrator at <code>admin@communityfridge.org</code>.
          </p>
        </section>
      </div>
    </div>
  );
};
