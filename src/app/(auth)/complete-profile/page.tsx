import type { Metadata } from "next";
import LoginForm from "@/components/modules/gestionpersonal/auth/LoginForm";
import CompleteProfile from "@/components/modules/gestionpersonal/auth/CompleteProfile";

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
