import { Link } from "react-router-dom";
import { StudentRegistrationForm } from "../../components/auth/StudentRegistrationForm";
import { AuthLayout } from "../../layouts/AuthLayout";

export default function RegisterPage() {
  return (
    <AuthLayout
      compact
      title="Student registration"
      subtitle="Register as a student to get full access to the platform."
    >
      <StudentRegistrationForm />
      <p className="mt-5 text-center text-xs text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
