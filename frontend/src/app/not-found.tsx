import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-extrabold text-brand-blue">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-500 dark:text-slate-400">
        The page you're looking for doesn't exist or may have moved. Try one of these instead:
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
        <Link href="/blog">
          <Button variant="outline">Browse Blog</Button>
        </Link>
        <Link href="/jobs">
          <Button variant="outline">Browse Jobs</Button>
        </Link>
      </div>
    </div>
  );
}
