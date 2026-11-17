import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../utils/usePageTitle.js';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Terms = () => {
  usePageTitle('Terms of Use (Draft)');

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
          Notice: This draft terms agreement outlines volunteer food safety rules and authorized use standards for college project demonstration purposes. Prior to real community launch, this agreement must be formally evaluated by an environmental health officer and qualified legal counsel to ensure compliance with the Food Safety Act 1990 and Food Hygiene (England) Regulations 2006.
        </p>
      </div>

      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#1C1B19]">
          Terms of Authorised Volunteer Use
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Last revised: 17 November 2026. Version: 1.0-draft.
        </p>
      </div>

      {/* Terms Content */}
      <div className="prose prose-stone text-xs text-stone-700 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            1. Authorised Access Only
          </h2>
          <p>
            Access to this portal is restricted to accredited volunteers and coordinators trained in community fridge operation. Account credentials must not be shared with unauthorized members or the general public.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            2. Food Safety and Donation Intake Duties
          </h2>
          <p>
            When recording food items into the system, volunteers agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verify the manufacturer use-by or best-before date printed on the original packaging.</li>
            <li>Inspect packaging for broken seals, leaks, puffing, or signs of pest ingress.</li>
            <li>Verify that high-risk chilled foods have been stored at or below 4 degrees Celsius.</li>
            <li>Record any known allergen notices (nuts, dairy, gluten, shellfish, etc.) accurately.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            3. Mandatory Waste and Disposal Logging
          </h2>
          <p>
            Any item removed from the fridge for disposal must be recorded immediately with its verified reason (expired, spoiled, damaged packaging, contamination suspected, or official recall). Disposals without valid audited justification are prohibited.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            4. Prototype Project Status
          </h2>
          <p>
            This application is created as a college software engineering project demonstration. In a production community deployment, all physical distribution must comply with local council environmental health registration requirements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            5. Termination of Access
          </h2>
          <p>
            Fridge administrators reserve the right to deactivate account access at any time if safety procedures or hygienic standards are violated.
          </p>
        </section>
      </div>
    </div>
  );
};
