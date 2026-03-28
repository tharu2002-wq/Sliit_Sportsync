import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage } from "../../utils/apiError";
import { getLoginEmailError, getPasswordValidationError, PASSWORD_MIN_LENGTH } from "../../utils/registrationValidation";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { TextField } from "../ui/TextField";

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearFieldError = (key) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = (fd) => {
    const next = {};
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");

    const emailErr = getLoginEmailError(email);
    if (emailErr) next.email = emailErr;

    const passwordErr = getPasswordValidationError(password);
    if (passwordErr) next.password = passwordErr;

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const fd = new FormData(e.currentTarget);

    if (!validate(fd)) return;

    const payload = {
      email: String(fd.get("email")).trim().toLowerCase(),
      password: String(fd.get("password")),
    };

    setLoading(true);
    try {
      const data = await login(payload);
      const role = data?.role ?? "";
      if (role === "student") {
        navigate("/student/events", { replace: true });
      } else if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true, state: { loggedIn: true } });
      }
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <TextField
        id="login-email"
        name="email"
        type="email"
        label="Email"
        compact
        error={fieldErrors.email}
        autoComplete="email"
        required
        onChange={() => clearFieldError("email")}
      />

      <TextField
        id="login-password"
        name="password"
        type="password"
        label="Password"
        compact
        error={fieldErrors.password}
        autoComplete="current-password"
        required
        minLength={PASSWORD_MIN_LENGTH}
        onChange={() => clearFieldError("password")}
      />

      {submitError ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {submitError}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="sm" fullWidth disabled={loading} className="py-2 text-sm font-bold">
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" tone="onPrimary" />
            Signing in…
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
