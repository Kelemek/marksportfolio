import { OTP_CODE_LENGTH, OTP_RESEND_COOLDOWN_SECONDS } from "@/lib/auth/constants";
import LoginError from "@/components/login/LoginError";

type OtpStepProps = {
  email: string;
  code: string;
  loading: boolean;
  resendLoading: boolean;
  resendCooldownSeconds: number;
  error: string;
  onCodeChange: (code: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onResend: () => void;
  onReset: () => void;
};

export default function OtpStep({
  email,
  code,
  loading,
  resendLoading,
  resendCooldownSeconds,
  error,
  onCodeChange,
  onSubmit,
  onResend,
  onReset,
}: OtpStepProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-pink/20 text-pink border border-pink/50 text-center">
        <p className="text-sm">We&apos;ve sent a verification code to:</p>
        <p className="font-semibold mt-1 text-white">{email}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="otp-code" className="block text-white mb-2">
            Verification Code
          </label>
          <input
            id="otp-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={OTP_CODE_LENGTH}
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            placeholder="000000"
            autoFocus
            disabled={loading}
            className="w-full px-4 py-3 text-center text-2xl font-semibold tracking-widest bg-border-light border border-border-light rounded-lg text-white placeholder-white-1 focus:outline-hidden focus:border-pink transition-colors disabled:opacity-50"
          />
        </div>

        {error ? <LoginError message={error} /> : null}

        {loading ? (
          <p className="text-center text-white-1 text-sm">Verifying code...</p>
        ) : null}

        <button
          type="button"
          onClick={onResend}
          disabled={resendLoading || loading || resendCooldownSeconds > 0}
          className="w-full text-sm text-pink hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendLoading
            ? "Sending..."
            : resendCooldownSeconds > 0
              ? `Resend code in ${resendCooldownSeconds}s`
              : "Resend Code"}
        </button>
      </form>

      <p className="text-xs text-white-1 text-center">
        Check your spam folder if needed. Codes expire in 10 minutes. Resend is
        available once every {OTP_RESEND_COOLDOWN_SECONDS} seconds.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="w-full py-2 text-center text-sm text-pink hover:underline border border-border-light rounded-lg"
      >
        ← Try a different email
      </button>
    </div>
  );
}
