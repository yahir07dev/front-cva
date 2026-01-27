import type { Metadata } from "next";
import LoginForm from "@/src/components/auth/LoginForm";
import CompleteProfile from "@/src/components/auth/CompleteProfile";

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
