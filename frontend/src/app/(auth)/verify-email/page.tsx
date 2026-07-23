"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("This verification link is missing its token.");
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err?.response?.data?.message || "This verification link is invalid or has expired.");
      });
  }, [token]);

  return (
    <Card>
      <h1 className="text-2xl font-bold">Email verification</h1>

      {status === "verifying" && <p className="mt-6 text-sm text-slate-500">Verifying your email...</p>}

      {status === "success" && (
        <>
          <p className="mt-6 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            Your email has been verified.
          </p>
          <Link href="/dashboard">
            <Button className="mt-4 w-full">Go to dashboard</Button>
          </Link>
        </>
      )}

      {status === "error" && (
        <p className="mt-6 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
          {errorMessage}
        </p>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full max-w-md">
        <Suspense fallback={null}>
          <VerifyEmailContent />
        </Suspense>
      </motion.div>
    </div>
  );
}