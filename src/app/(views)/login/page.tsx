"use client";
/**
 * Patient login (abridged sample).
 * The patient types the access code written on the clinic card (the QR code on the
 * same card opens this page). No password: the code is the key.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSession, signIn } from "next-auth/react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import GlobalLoader from "@/components/ui/common/GlobalLoader";
import { isValidCode, normalizeCode } from "@/utils/patientCode";

export default function SignIn() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Forgive typing differences ("ab 1234", Arabic digits...) before asking the server.
    const normalized = normalizeCode(code);
    if (!isValidCode(normalized)) return setError("The code looks like AB-1234. Please check it and try again.");

    setLoading(true);
    const res = await signIn("credentials", { code: normalized, redirect: false });

    if (res?.ok) {
      const session = await getSession();
      if (session?.user?.id) {
        setRedirecting(true);
        router.push(`/profile/${session.user.id}`);
        return;
      }
    }
    setError("The code you entered is incorrect. Please try again.");
    setLoading(false);
  }

  return (
    <div>
      {redirecting && <GlobalLoader />}
      <div className="flex flex-col md:flex-row w-full h-[calc(100vh-64px)] overflow-hidden">
        <div className="md:px-10 px-4 flex flex-col justify-center flex-1 w-full">
          <Image src="/images/logo.svg" alt="Logo" width={150} height={150} className="mx-auto mb-4" priority />
          <h1 className="text-center font-semibold text-xl lg:text-4xl mb-8">Welcome Back</h1>

          <form className="space-y-6 lg:px-8" onSubmit={submit}>
            <p className="text-sm text-gray-500">Enter the access code written on your clinic card.</p>
            <div>
              <Label>Access Code <span className="text-error-500">*</span></Label>
              <Input name="code" placeholder="AB-1234" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
            <Button className="w-full" size="sm" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Sign In"}
            </Button>
          </form>
        </div>

        {/* Decorative image is hidden on phones so the form gets the full screen */}
        <div className="hidden md:block md:w-1/2 relative">
          <Image fill priority className="object-cover object-left" src="/images/auth-hero.webp" alt="" />
        </div>
      </div>
    </div>
  );
}
