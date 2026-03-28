import { Link } from "react-router-dom";
import { LoginForm } from "../../components/auth/LoginForm";
import { AuthLayout } from "../../layouts/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout compact title="Sign in" subtitle="Log in with your university email and password.">
      <LoginForm />
      <p className="mt-5 text-center text-xs text-gray-500">
        New to SportSync?{" "}
        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
          Register as a student
        </Link>
      </p>
    </AuthLayout>
  );
}
