import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How StudentLife Hungary collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: {new Date().getFullYear()}</p>
      <div className="prose prose-slate mt-6 max-w-none dark:prose-invert">
        <h2>Information we collect</h2>
        <p>
          When you create an account, we collect your name, email address, and a
          securely hashed password. If you sign in with Google, we receive your name,
          email, and profile picture from Google. If you submit a job or accommodation
          listing, we collect the details you provide in that listing.
        </p>
        <h2>How we use your information</h2>
        <ul>
          <li>To create and manage your account</li>
          <li>To let you save bookmarks and manage listings you've submitted</li>
          <li>To send account-related emails (verification, password reset)</li>
          <li>To send newsletter content, only if you've explicitly subscribed</li>
        </ul>
        <h2>Data storage and security</h2>
        <p>
          Passwords are hashed and never stored in plain text. Authentication tokens
          use short-lived access tokens and httpOnly refresh cookies. We don't sell
          your personal data to third parties.
        </p>
        <h2>Cookies</h2>
        <p>
          We use essential cookies required for authentication to function (keeping
          you signed in). We don't use third-party tracking or advertising cookies.
        </p>
        <h2>Your rights</h2>
        <p>
          You can update your profile information at any time from your dashboard, and
          can request account deletion by contacting us.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent through our{" "}
          <a href="/contact">Contact page</a>.
        </p>
      </div>
    </div>
  );
}
