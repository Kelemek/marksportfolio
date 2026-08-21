import { OTP_CODE_LENGTH } from "@/lib/auth/constants";
import LoginError from "@/components/login/LoginError";

type EmailStepProps = {
  email: string;
  loading: boolean;
  error: string;
  onEmailChange: (email: string) => void;
  onSubmit: (event: React.FormEvent) => void;
};

export default function EmailStep({
  email,
  loading,
  error,
  onEmailChange,
  onSubmit,
}: EmailStepProps) {
  const isValidEmail =
    email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-white mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          required
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full px-4 py-3 bg-border-light border border-border-light rounded-lg text-white placeholder-white-1 focus:outline-hidden focus:border-pink transition-colors"
        />
        <p className="mt-2 text-xs text-white-1">
          We&apos;ll send you a secure {OTP_CODE_LENGTH}-digit verification code
        </p>
      </div>

      {error ? <LoginError message={error} /> : null}

      <button
        type="submit"
        disabled={loading || !isValidEmail}
        className="btn w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send Verification Code"}
      </button>
    </form>
  );
}
