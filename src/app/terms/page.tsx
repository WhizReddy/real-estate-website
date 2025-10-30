import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Real Estate Explorer',
  description: 'Review the Terms of Service for using the Real Estate Explorer platform.',
};

export default function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Terms of Service</h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
          These terms outline the rules and regulations for using the Real Estate Explorer platform. By accessing the
          site you accept these terms in full.
        </p>
      </header>

      <section className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        <p>
          <strong className="font-semibold">Use of Service:</strong> You agree to use Real Estate Explorer solely for lawful
          purposes and agree not to engage in any activity that disrupts or interferes with the operation of the
          site.
        </p>
        <p>
          <strong className="font-semibold">Accounts:</strong> You are responsible for maintaining the confidentiality of your
          login credentials and all activities that occur under your account.
        </p>
        <p>
          <strong className="font-semibold">Content:</strong> Property listings, images, and descriptions are provided for
          informational purposes. We strive to keep information accurate but cannot guarantee completeness or
          availability.
        </p>
        <p>
          <strong className="font-semibold">Updates:</strong> We may update these terms periodically. Continued use of the
          service after changes take effect constitutes acceptance of the updated terms.
        </p>
        <p>
          If you have questions about these terms, please contact our support team at
          <a className="ml-1 text-blue-600 hover:underline" href="mailto:support@pasurite-tiranes.al">
            support@pasurite-tiranes.al
          </a>
          .
        </p>
      </section>
    </main>
  );
}
