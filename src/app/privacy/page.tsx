import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Real Estate Explorer',
  description: 'Learn how Real Estate Explorer collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Privacy Policy</h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
          We value your privacy and are committed to safeguarding your personal data. This policy explains what
          information we collect, how we use it, and the choices available to you.
        </p>
      </header>

      <section className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        <p>
          <strong className="font-semibold">Information We Collect:</strong> We collect account details, property preferences,
          and activity logs to personalize your experience and improve our services.
        </p>
        <p>
          <strong className="font-semibold">How We Use Data:</strong> Data is used to power property recommendations, respond to
          inquiries, and ensure platform security. We never sell your personal information.
        </p>
        <p>
          <strong className="font-semibold">Third-Party Services:</strong> We may share limited data with trusted partners such as
          mapping providers and analytics tools, strictly for delivering core functionality.
        </p>
        <p>
          <strong className="font-semibold">Your Choices:</strong> You can request access, updates, or deletion of your data by
          contacting our support team. Opt-out options are available for marketing communications.
        </p>
        <p>
          <strong className="font-semibold">Contact Us:</strong> For questions about this policy, email
          <a className="ml-1 text-blue-600 hover:underline" href="mailto:privacy@pasurite-tiranes.al">
            privacy@pasurite-tiranes.al
          </a>
          .
        </p>
      </section>
    </main>
  );
}
