import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage } from "../../utils/apiError";
import {
  getMySliitEmailError,
  getNameValidationError,
  getPasswordValidationError,
  PASSWORD_MIN_LENGTH,
} from "../../utils/registrationValidation";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { TextField } from "../ui/TextField";

export function StudentRegistrationForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
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
    const name = String(fd.get("name") ?? "");
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const confirmPassword = String(fd.get("confirmPassword") ?? "");

    const nameErr = getNameValidationError(name);
    if (nameErr) next.name = nameErr;

    const emailErr = getMySliitEmailError(email);
    if (emailErr) next.email = emailErr;

    const passwordErr = getPasswordValidationError(password);
    if (passwordErr) next.password = passwordErr;

    if (!confirmPassword) next.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) next.confirmPassword = "Passwords do not match";

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const fd = new FormData(e.currentTarget);

    if (!validate(fd)) return;

    const role = String(fd.get("role") ?? "student");
    const payload = {
      name: String(fd.get("name")).trim(),
      email: String(fd.get("email")).trim().toLowerCase(),
      password: String(fd.get("password")),
      role,
    };

    setLoading(true);
    try {
      await register(payload);
      navigate("/student/events", { replace: true });
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <input type="hidden" name="role" value="student" readOnly tabIndex={-1} aria-hidden="true" />

      <TextField
        id="reg-name"
        name="name"
        label="Full name"
        compact
        error={fieldErrors.name}
        autoComplete="name"
        required
        onChange={() => clearFieldError("name")}
      />

      <TextField
        id="reg-email"
        name="email"
        type="email"
        label="University email"
        compact
        error={fieldErrors.email}
        autoComplete="email"
        required
        onChange={() => clearFieldError("email")}
      />

      <TextField
        id="reg-password"
        name="password"
        type="password"
        label="Password"
        compact
        error={fieldErrors.password}
        autoComplete="new-password"
        required
        minLength={PASSWORD_MIN_LENGTH}
        onChange={() => clearFieldError("password")}
      />

      <TextField
        id="reg-confirm"
        name="confirmPassword"
        type="password"
        label="Confirm password"
        compact
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
        required
        onChange={() => clearFieldError("confirmPassword")}
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
            Creating account…
          </span>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
