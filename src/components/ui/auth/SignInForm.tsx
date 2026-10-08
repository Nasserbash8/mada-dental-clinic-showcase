"use client";
/**
 * SignInForm - doctor sign-in (abridged sample).
 * The server answers with an HttpOnly session cookie, so nothing secret is
 * stored in the browser by this component.
 */
import { useState } from "react";
import validator from "validator";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Cheap client-side check first; the server validates again.
    if (!validator.isEmail(email)) return setError("Invalid email address.");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/signIn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) window.location.href = "/dashboard"; // full reload so the middleware sees the new cookie
      else setError(data.message || "Invalid email or password.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center w-full min-h-screen">
      <form onSubmit={submit} className="w-full max-w-md px-4 space-y-6" noValidate>
        <h1 className="font-semibold text-gray-800 text-title-sm">Sign in</h1>

        <div>
          <Label htmlFor="email">Email <span className="text-error-500">*</span></Label>
          <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password <span className="text-error-500">*</span></Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
        <Button className="w-full" size="sm" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
