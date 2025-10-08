"use client";

import type React from "react";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GoogleButton } from "@/components/auth/google-button";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

export function RecruiterLoginForm() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log(email, password);
    const result = await signIn("credentials", {
      redirect: false,
      email: email,
      password: password,
    });
    console.log("Sign-in Result", result);

    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        toast.error(`Login Failed`);
      } else {
        toast.error(`${result?.error}`);
      }
    }

    if (result?.url) {
      router.replace("/recruiter");
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recruiter Login</CardTitle>
        <CardDescription>Sign in to your recruiter account</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email ID</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full">
            Login as Recruiter
          </Button>

          <div className="text-center text-xs text-muted-foreground">or</div>
          <GoogleButton
            onClick={async () => {
              await signIn("google", { callbackUrl: "/recruiter" });
            }}
          />

          <p className="text-xs text-muted-foreground text-center">
            New to our platform?{" "}
            <Link
              href={pathname === "/recruiter/login" ? "/recruiter/register" : "/recruiter/register"}
              className="text-primary underline underline-offset-4"
            >
              Register now
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
