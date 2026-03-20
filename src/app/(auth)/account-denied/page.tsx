import type { Metadata } from "next";
import LoginForm from "@/src/components/auth/LoginForm";
import CompleteProfile from "@/src/components/auth/CompleteProfile";
import AccountDenied from "@/src/components/shared/AccountDenied";

export const metadata: Metadata = {
  title: "Cuenta eliminada",
  description: "No tienes acceso",
};

export default function LoginPage() {
  return (
    <div>
      <AccountDenied></AccountDenied>
    </div>
  );
}
