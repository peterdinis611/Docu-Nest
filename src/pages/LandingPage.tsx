import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Headphones,
  Layers,
  Lock,
  Mail,
  Sparkles,
  User,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

/* ─── data ─────────────────────────────────────────────── */

const features = [
  {
    icon: FileText,
    color: "from-blue-500/20 to-blue-500/5 text-blue-500",
    title: "Source grounding",
    description: "Every answer cites the exact document it came from.",
  },
  {
    icon: Headphones,
    color: "from-violet-500/20 to-violet-500/5 text-violet-500",
    title: "Audio overviews",
    description: "Turn research into a conversational deep-dive podcast.",
  },
  {
    icon: Layers,
    color: "from-amber-500/20 to-amber-500/5 text-amber-500",
    title: "Studio outputs",
    description: "Study guides, briefing docs, timelines, flashcards.",
  },
  {
    icon: BookOpen,
    color: "from-emerald-500/20 to-emerald-500/5 text-emerald-500",
    title: "Smart library",
    description: "Organise PDFs, articles, and web pages in one place.",
  },
]

const stats = [
  { value: "50K+", label: "Documents" },
  { value: "12K+", label: "Researchers" },
  { value: "4.9★", label: "Rating" },
]

const perks = [
  "No credit card required",
  "Free tier available",
  "Cancel anytime",
]

/* ─── helpers ───────────────────────────────────────────── */

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length

  const label = ["Too short", "Weak", "Fair", "Strong", "Very strong"][score]
  const barColor = [
    "bg-destructive",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-emerald-500",
    "bg-emerald-500",
  ][score]

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i < score ? barColor : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function PasswordInput({
  id,
  placeholder,
  autoComplete,
  value,
  onChange,
  minLength,
}: {
  id: string
  placeholder: string
  autoComplete: string
  value: string
  onChange: (v: string) => void
  minLength?: number
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-10"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

function Spinner() {
  return (
    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
  )
}

/* ─── forms ─────────────────────────────────────────────── */

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); onSuccess() }, 900)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="login-email">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" htmlFor="login-password">
            Password
          </label>
          <button type="button" className="text-xs text-primary hover:underline">
            Forgot password?
          </button>
        </div>
        <PasswordInput
          id="login-password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />
      </div>

      <Button
        type="submit"
        className="mt-2 w-full gap-2 shadow-md shadow-primary/20"
        disabled={loading}
      >
        {loading ? <Spinner /> : <ArrowRight className="size-4" />}
        Sign in to DocuNest
      </Button>
    </form>
  )
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); onSuccess() }, 900)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="reg-name">
          Full name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="reg-name"
            type="text"
            placeholder="Jane Smith"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="reg-email">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="reg-password">
          Password
        </label>
        <PasswordInput
          id="reg-password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          minLength={8}
        />
        {password.length > 0 && <PasswordStrength password={password} />}
      </div>

      <Button
        type="submit"
        className="mt-2 w-full gap-2 shadow-md shadow-primary/20"
        disabled={loading}
      >
        {loading ? <Spinner /> : <Zap className="size-4" />}
        Create free account
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        By signing up you agree to our{" "}
        <button type="button" className="text-primary hover:underline">Terms</button>
        {" "}and{" "}
        <button type="button" className="text-primary hover:underline">Privacy Policy</button>.
      </p>
    </form>
  )
}

/* ─── page ──────────────────────────────────────────────── */

export function LandingPage() {
  const navigate = useNavigate()
  const handleSuccess = () => navigate("/app")

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">

      {/* ── top-right controls ── */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* ── left panel ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar px-10 py-10 lg:flex lg:w-[55%]">

        {/* mesh grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--sidebar-border) 1px, transparent 1px), linear-gradient(90deg, var(--sidebar-border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* ambient glow blobs */}
        <div className="pointer-events-none absolute -left-32 -top-32 size-[500px] rounded-full bg-sidebar-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 size-[400px] rounded-full bg-sidebar-primary/8 blur-3xl" />

        {/* logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary shadow-lg shadow-sidebar-primary/40">
            <Sparkles className="size-[18px] text-sidebar-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
            DocuNest
          </span>
        </div>

        {/* main content */}
        <div className="relative max-w-lg space-y-10">

          {/* badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sidebar-primary/30 bg-sidebar-primary/10 px-3.5 py-1.5">
            <Zap className="size-3.5 text-sidebar-primary" />
            <span className="text-xs font-semibold text-sidebar-primary">
              AI-powered research assistant
            </span>
          </div>

          {/* headline */}
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-sidebar-foreground xl:text-6xl">
              Your documents,
              <br />
              <span className="bg-gradient-to-r from-sidebar-primary to-sidebar-primary/60 bg-clip-text text-transparent">
                finally thinking.
              </span>
            </h1>
            <p className="text-lg leading-relaxed text-sidebar-muted">
              Upload PDFs, articles, and web pages. Ask questions, generate
              studio outputs, and get answers — all grounded in your sources.
            </p>
          </div>

          {/* features grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, color, title, description }) => (
              <div
                key={title}
                className="group rounded-xl border border-sidebar-border/60 bg-sidebar-accent/30 p-4 transition-colors hover:bg-sidebar-accent/60"
              >
                <div
                  className={cn(
                    "mb-3 inline-flex size-9 items-center justify-center rounded-lg bg-gradient-to-br",
                    color
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <p className="text-sm font-semibold text-sidebar-foreground">
                  {title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-sidebar-muted">
                  {description}
                </p>
              </div>
            ))}
          </div>

          {/* stats */}
          <div className="flex items-center gap-6">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-sidebar-foreground">
                  {value}
                </p>
                <p className="text-xs text-sidebar-muted">{label}</p>
              </div>
            ))}
            <div className="h-8 w-px bg-sidebar-border" />
            <div className="flex -space-x-2">
              {["bg-blue-400", "bg-violet-400", "bg-emerald-400", "bg-amber-400"].map(
                (c, i) => (
                  <div
                    key={i}
                    className={cn(
                      "size-8 rounded-full border-2 border-sidebar",
                      c
                    )}
                  />
                )
              )}
              <div className="flex size-8 items-center justify-center rounded-full border-2 border-sidebar bg-sidebar-accent text-[10px] font-bold text-sidebar-foreground">
                +8k
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="relative flex items-center justify-between">
          <p className="text-xs text-sidebar-muted/50">
            © {new Date().getFullYear()} DocuNest · All rights reserved
          </p>
          <div className="flex gap-4 text-xs text-sidebar-muted/50">
            <button type="button" className="hover:text-sidebar-muted">Privacy</button>
            <button type="button" className="hover:text-sidebar-muted">Terms</button>
          </div>
        </div>
      </div>

      {/* ── right panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
        {/* mobile logo */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">DocuNest</span>
        </div>

        <div className="w-full max-w-[400px] space-y-6">

          {/* perks */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
            {perks.map((p) => (
              <span
                key={p}
                className="flex items-center gap-1.5 text-[12px] text-muted-foreground"
              >
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                {p}
              </span>
            ))}
          </div>

          {/* card */}
          <div className="overflow-hidden rounded-2xl border bg-card shadow-xl shadow-black/[0.06]">

            {/* card header accent strip */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />

            <div className="p-7">
              <Tabs defaultValue="login" className="space-y-6">
                <div className="space-y-1 text-center">
                  <h2 className="text-xl font-bold tracking-tight">
                    Welcome to DocuNest
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Sign in or create a free account to get started
                  </p>
                </div>

                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign in</TabsTrigger>
                  <TabsTrigger value="register">Create account</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-0 space-y-0">
                  <LoginForm onSuccess={handleSuccess} />
                </TabsContent>

                <TabsContent value="register" className="mt-0 space-y-0">
                  <RegisterForm onSuccess={handleSuccess} />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* trust note */}
          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
            <Lock className="size-3" />
            Secured with industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  )
}
