import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Real Estate Explorer',
  description: 'Understand how cookies are used across the Real Estate Explorer experience.',
};

export default function CookiesPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900 ">Cookie Policy</h1>
        <p className="mt-2 text-base text-slate-600 ">
          Cookies help us deliver a faster and more personalized experience. This policy outlines the cookies we use
          and how you can manage your preferences.
        </p>
      </header>

      <section className="space-y-4 text-sm leading-relaxed text-slate-700 ">
        <p>
          <strong className="font-semibold">Essential Cookies:</strong> Required for authentication, security, and core site
          features. These cannot be disabled without affecting functionality.
        </p>
        <p>
          <strong className="font-semibold">Performance Cookies:</strong> Collect anonymous analytics on page usage to help us
          improve reliability and performance.
        </p>
        <p>
          <strong className="font-semibold">Preference Cookies:</strong> Remember your saved searches, preferred language, and
          layout choices so you can pick up where you left off.
        </p>
        <p>
          <strong className="font-semibold">Managing Cookies:</strong> Most browsers allow you to review and delete cookies. You
          can also opt out of analytics tracking via your account settings when available.
        </p>
        <p>
          For further details, contact our data protection team at
          <a className="ml-1 text-blue-600 hover:underline" href="mailto:privacy@pasurite-tiranes.al">
            privacy@pasurite-tiranes.al
          </a>
          .
        </p>
      </section>
    </main>
  );
}
