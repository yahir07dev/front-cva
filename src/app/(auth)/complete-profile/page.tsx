import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import CompleteProfile from "@/components/auth/CompleteProfile";

export const metadata: Metadata = {
  title: "Completar Registro",
  description: "Accede a tu cuenta",
};

export default function LoginPage() {
  return (
    <div>
      <CompleteProfile />
    </div>
  );
}
