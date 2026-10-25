import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck, Mail } from "lucide-react";

import AuthShell from "../../components/layout/AuthShell.jsx";
import Banner from "../../components/ui/Banner.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import { verifyEmail } from "../../services/authService.js";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let active = true;

    if (!token) {
      setLoading(false);
      setErrorMessage("No verification token was found in the link. Please check your verification email.");
      return;
    }

    const performVerification = async () => {
      try {
        await verifyEmail(token);
        if (active) {
          setSuccess(true);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          const data = err?.response?.data;
          setErrorMessage(
            data?.message ||
              "Email verification link is invalid or has expired. Tokens expire in 24 hours."
          );
          setLoading(false);
        }
      }
    };

    performVerification();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <AuthShell
      title={loading ? "Verifying Email" : success ? "Email Verified" : "Verification Failed"}
      subtitle={
        loading
          ? "Please wait while we verify your VYBE account credentials."
          : success
          ? "Your email address has been verified successfully."
          : "We were unable to complete your email verification."
      }
      footer={
        <>
          Ready to continue?{" "}
          <Link
            to="/login"
            className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-6 text-center">
        {loading && (
          <div className="py-8 space-y-4">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <Spinner size="lg" className="text-purple-400" />
            </div>
            <p className="text-sm text-zinc-300">
              Verifying security token with server…
            </p>
          </div>
        )}

        {!loading && success && (
          <div className="space-y-6 animate-fade-in">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-950/40">
              <CheckCircle2 className="size-10 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-100">
                Account Activated!
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Thank you for verifying your email address. You now have full access to explore, publish posts, connect with friends, and join communities on VYBE.
              </p>
            </div>

            <Link
              to="/login"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 hover:from-purple-500 hover:to-indigo-500 transition-all duration-fast"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}

        {!loading && !success && (
          <div className="space-y-6 animate-fade-in">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 shadow-xl shadow-rose-950/40">
              <XCircle className="size-10 text-rose-400" />
            </div>

            {errorMessage && (
              <Banner variant="danger" className="text-left">
                {errorMessage}
              </Banner>
            )}

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left space-y-3">
              <div className="text-xs font-semibold text-zinc-200">
                What can you do?
              </div>
              <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
                <li>If the token expired (over 24 hours old), request a fresh verification link.</li>
                <li>Make sure you copied or clicked the complete link from your email.</li>
                <li>If your account is already verified, you can sign in directly.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link
                to="/verify-email-pending"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-600/10 px-4 text-xs font-semibold text-purple-300 hover:bg-purple-600/20 transition-all"
              >
                <Mail className="size-4" />
                <span>Request New Verification Email</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 px-4 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-all"
              >
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
