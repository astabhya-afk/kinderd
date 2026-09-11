"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Mail, Lock, Sun, Moon, ArrowRight, ShieldCheck } from "lucide-react"
import { authenticate } from "@/lib/kindred-auth"

type Theme = "light" | "dark"

type Step = "credentials" | "verify"

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function AuthLogin({
  theme,
  onToggleTheme,
  onSignIn,
}: {
  theme: Theme
  onToggleTheme: () => void
  onSignIn: (email: string) => void
}) {
  const [step, setStep] = useState<Step>("credentials")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true)

  const [sentCode, setSentCode] = useState("")
  const [enteredCode, setEnteredCode] = useState("")
  const [error, setError] = useState("")
  const codeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("kindred-email")
    if (saved) setEmail(saved)
  }, [])

  useEffect(() => {
    if (step === "verify") codeInputRef.current?.focus()
  }, [step])

  function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return

    const result = authenticate(email, password)
    if (!result.ok) {
      setError(result.error)
      return
    }

    if (remember) {
      localStorage.setItem("kindred-email", email)
    } else {
      localStorage.removeItem("kindred-email")
    }
    const code = generateCode()
    setSentCode(code)
    setEnteredCode("")
    setError("")
    setStep("verify")
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (enteredCode.trim() === sentCode) {
      onSignIn(email)
    } else {
      setError("That code doesn't match. Check the code we sent and try again.")
    }
  }

  function resendCode() {
    const code = generateCode()
    setSentCode(code)
    setEnteredCode("")
    setError("")
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground p-1.5">
            <Image src="/kindred-logo.png" alt="" width={24} height={24} className="size-6" />
          </div>
          <span className="text-lg font-bold tracking-tight">Kindred</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-balance text-4xl font-bold leading-tight tracking-tight">
            Opportunities that actually fit your skills.
          </h2>
          <p className="mt-4 text-pretty text-primary-foreground/80">
            Kindred scores every job, gig, project, and mentorship against your profile so the
            strongest matches rise to the top.
          </p>
        </div>

        <div />

        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary-foreground/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-10 size-56 rounded-full bg-primary-foreground/10 blur-2xl" />
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="absolute right-6 top-6 flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          {theme === "light" ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
        </button>

        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Image src="/kindred-logo.png" alt="" width={28} height={28} className="size-7" />
            <span className="text-lg font-bold tracking-tight text-foreground">Kindred</span>
          </div>

          {step === "credentials" ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to see your ranked matches.
              </p>

              <form onSubmit={handleCredentials} className="mt-8 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-11 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="size-4 rounded border-border text-primary accent-primary"
                  />
                  Remember me
                </label>

                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                <button
                  type="submit"
                  className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Continue
                  <ArrowRight className="size-4" />
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <button type="button" className="font-medium text-primary hover:underline">
                  Create one
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <ShieldCheck className="size-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Verify your email</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-foreground">{email}</span>. Enter it below to
                confirm it&apos;s really you.
              </p>

              <div className="mt-4 rounded-xl border border-dashed border-primary/40 bg-accent/50 px-4 py-3 text-sm text-accent-foreground">
                Demo code: <span className="font-mono font-semibold tracking-widest">{sentCode}</span>
              </div>

              <form onSubmit={handleVerify} className="mt-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="code" className="text-sm font-medium text-foreground">
                    Verification code
                  </label>
                  <input
                    id="code"
                    ref={codeInputRef}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    value={enteredCode}
                    onChange={(e) => {
                      setEnteredCode(e.target.value.replace(/\D/g, ""))
                      setError("")
                    }}
                    placeholder="••••••"
                    className="h-12 w-full rounded-xl border border-border bg-card px-4 text-center text-lg font-semibold tracking-[0.5em] text-foreground outline-none transition-colors placeholder:tracking-[0.3em] placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {error ? <p className="text-sm text-destructive">{error}</p> : null}
                </div>

                <button
                  type="submit"
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Verify and continue
                  <ArrowRight className="size-4" />
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="font-medium text-muted-foreground hover:text-foreground"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={resendCode}
                  className="font-medium text-primary hover:underline"
                >
                  Resend code
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
