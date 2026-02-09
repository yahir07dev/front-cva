import type { Metadata } from "next";
import LoginForm from "@/src/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta",
};

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#110417] px-4">
      <LoginForm />
    </div>
  );
}
