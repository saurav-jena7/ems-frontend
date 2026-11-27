"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { Users, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

// ── Validation ──────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(v: string): string | null {
  if (!v.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(v.trim())) return "Enter a valid email (e.g. name@example.com)";
  return null;
}
function validatePassword(v: string): string | null {
  if (!v) return "Password is required";
  if (v.length < 6) return "Password must be at least 6 characters";
  return null;
}

// ── Error pill ──────────────────────────────────────────────────────────────
function ErrPill({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
      <svg className="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  );
}

// ── Component ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [emailErr,   setEmailErr]   = useState<string | null>(null);
  const [passErr,    setPassErr]    = useState<string | null>(null);
  const [touched,    setTouched]    = useState({ email: false, password: false });

  // Reset everything on mount (handles back-after-logout)
  useEffect(() => {
    setEmail(""); setPassword(""); setShowPass(false);
    setEmailErr(null); setPassErr(null);
    setTouched({ email: false, password: false });
  }, []);

  const bc = (err: string | null, t: boolean) =>
    t && err ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-blue-500";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailErr(eErr); setPassErr(pErr);
    setTouched({ email: true, password: true });
    if (eErr || pErr) return;

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email: email.trim(), password });
      saveAuth(res.data.token, res.data.user);
      toast.success("Welcome back, " + res.data.user.name + "!");
      router.push("/employees");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* h-screen + overflow-hidden locks the entire page to the viewport */
    <div className="h-screen overflow-hidden flex">

      {/* ── Left panel — fixed height, nothing scrolls ─────────────────── */}
      <div className="hidden lg:flex flex-col w-[55%] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 relative overflow-hidden">

        {/* Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-blue-300/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 px-10 pt-8 flex items-center gap-3 shrink-0">
          <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
            <Users size={24} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Employee MS</span>
        </div>

        {/* Centre content — fills remaining space */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 pb-8 gap-7 min-h-0">

          {/* SVG illustration — responsive, never overflows */}
          <div className="w-full max-w-xs shrink-0">
            <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl">
              <rect x="60" y="230" width="360" height="18" rx="6" fill="white" fillOpacity="0.25"/>
              <rect x="80" y="248" width="14" height="60" rx="4" fill="white" fillOpacity="0.18"/>
              <rect x="386" y="248" width="14" height="60" rx="4" fill="white" fillOpacity="0.18"/>
              <rect x="160" y="130" width="160" height="104" rx="10" fill="white" fillOpacity="0.18" stroke="white" strokeOpacity="0.4" strokeWidth="2"/>
              <rect x="168" y="138" width="144" height="80" rx="6" fill="white" fillOpacity="0.12"/>
              <rect x="178" y="150" width="80" height="7" rx="3" fill="white" fillOpacity="0.5"/>
              <rect x="178" y="163" width="60" height="5" rx="2.5" fill="white" fillOpacity="0.3"/>
              <rect x="178" y="174" width="100" height="5" rx="2.5" fill="white" fillOpacity="0.3"/>
              <rect x="178" y="185" width="70" height="5" rx="2.5" fill="white" fillOpacity="0.3"/>
              <circle cx="290" cy="155" r="6" fill="#4ade80" fillOpacity="0.9"/>
              <rect x="228" y="234" width="24" height="12" rx="3" fill="white" fillOpacity="0.2"/>
              <rect x="210" y="244" width="60" height="6" rx="3" fill="white" fillOpacity="0.2"/>
              <rect x="185" y="258" width="110" height="22" rx="5" fill="white" fillOpacity="0.18" stroke="white" strokeOpacity="0.3" strokeWidth="1.5"/>
              <rect x="193" y="264" width="8" height="6" rx="1.5" fill="white" fillOpacity="0.3"/>
              <rect x="206" y="264" width="8" height="6" rx="1.5" fill="white" fillOpacity="0.3"/>
              <rect x="219" y="264" width="8" height="6" rx="1.5" fill="white" fillOpacity="0.3"/>
              <rect x="232" y="264" width="8" height="6" rx="1.5" fill="white" fillOpacity="0.3"/>
              <rect x="245" y="264" width="8" height="6" rx="1.5" fill="white" fillOpacity="0.3"/>
              <rect x="258" y="264" width="8" height="6" rx="1.5" fill="white" fillOpacity="0.3"/>
              <rect x="271" y="264" width="8" height="6" rx="1.5" fill="white" fillOpacity="0.3"/>
              <rect x="208" y="290" width="64" height="8" rx="4" fill="white" fillOpacity="0.22"/>
              <rect x="230" y="298" width="8" height="30" rx="4" fill="white" fillOpacity="0.18"/>
              <rect x="242" y="298" width="8" height="30" rx="4" fill="white" fillOpacity="0.18"/>
              <ellipse cx="240" cy="296" rx="22" ry="14" fill="white" fillOpacity="0.3"/>
              <circle cx="240" cy="270" r="20" fill="white" fillOpacity="0.35"/>
              <circle cx="233" cy="268" r="2.5" fill="white" fillOpacity="0.7"/>
              <circle cx="247" cy="268" r="2.5" fill="white" fillOpacity="0.7"/>
              <path d="M234 276 Q240 281 246 276" stroke="white" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M222 264 Q240 252 258 264" stroke="white" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" fill="none"/>
              <circle cx="380" cy="168" r="18" fill="white" fillOpacity="0.3"/>
              <circle cx="373" cy="166" r="2" fill="white" fillOpacity="0.7"/>
              <circle cx="387" cy="166" r="2" fill="white" fillOpacity="0.7"/>
              <path d="M375 173 Q380 177 385 173" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <ellipse cx="380" cy="210" rx="18" ry="22" fill="white" fillOpacity="0.2"/>
              <circle cx="100" cy="168" r="18" fill="white" fillOpacity="0.3"/>
              <circle cx="93" cy="166" r="2" fill="white" fillOpacity="0.7"/>
              <circle cx="107" cy="166" r="2" fill="white" fillOpacity="0.7"/>
              <path d="M95 173 Q100 177 105 173" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <ellipse cx="100" cy="210" rx="18" ry="22" fill="white" fillOpacity="0.2"/>
              <rect x="60" y="80" width="120" height="52" rx="10" fill="white" fillOpacity="0.18" stroke="white" strokeOpacity="0.35" strokeWidth="1.5"/>
              <circle cx="85" cy="106" r="12" fill="white" fillOpacity="0.3"/>
              <rect x="104" y="98" width="60" height="6" rx="3" fill="white" fillOpacity="0.5"/>
              <rect x="104" y="110" width="40" height="5" rx="2.5" fill="white" fillOpacity="0.3"/>
              <rect x="300" y="58" width="130" height="52" rx="10" fill="white" fillOpacity="0.18" stroke="white" strokeOpacity="0.35" strokeWidth="1.5"/>
              <circle cx="324" cy="84" r="12" fill="#a5f3fc" fillOpacity="0.5"/>
              <rect x="343" y="76" width="68" height="6" rx="3" fill="white" fillOpacity="0.5"/>
              <rect x="343" y="88" width="48" height="5" rx="2.5" fill="white" fillOpacity="0.3"/>
              <rect x="68" y="200" width="12" height="30" rx="3" fill="white" fillOpacity="0.3"/>
              <rect x="85" y="210" width="12" height="20" rx="3" fill="white" fillOpacity="0.3"/>
              <rect x="102" y="192" width="12" height="38" rx="3" fill="white" fillOpacity="0.3"/>
              <rect x="119" y="205" width="12" height="25" rx="3" fill="white" fillOpacity="0.3"/>
              <circle cx="340" cy="170" r="3" fill="white" fillOpacity="0.6"/>
              <circle cx="354" cy="155" r="2" fill="white" fillOpacity="0.4"/>
              <circle cx="145" cy="130" r="2.5" fill="white" fillOpacity="0.5"/>
              <circle cx="130" cy="148" r="1.5" fill="white" fillOpacity="0.3"/>
            </svg>
          </div>

          {/* Tagline */}
          <div className="text-center shrink-0">
            <h2 className="text-white text-2xl font-bold leading-snug mb-2">
              Manage your team<br />with ease
            </h2>
            <p className="text-blue-200 text-sm max-w-xs mx-auto leading-relaxed">
              Add, track and organise all your employee records in one place.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-10 shrink-0">
            {[{ value: "100%", label: "Secure" }, { value: "Fast", label: "Real-time" }, { value: "Easy", label: "To use" }].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-white font-bold text-base">{s.value}</div>
                <div className="text-blue-300 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — scrollable if viewport is very short ─────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white overflow-y-auto px-6 py-8">

        {/* Mobile brand */}
        <div className="flex lg:hidden items-center gap-2 mb-6 shrink-0">
          <div className="bg-blue-700 text-white p-2 rounded-xl">
            <Users size={22} />
          </div>
          <span className="text-gray-800 font-bold text-xl">Employee MS</span>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-6">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Email address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (touched.email) setEmailErr(validateEmail(e.target.value)); }}
                  onBlur={() => { setTouched(t => ({ ...t, email: true })); setEmailErr(validateEmail(email)); }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 transition ${bc(emailErr, touched.email)}`}
                />
              </div>
              <ErrPill msg={touched.email ? emailErr : null} />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (touched.password) setPassErr(validatePassword(e.target.value)); }}
                  onBlur={() => { setTouched(t => ({ ...t, password: true })); setPassErr(validatePassword(password)); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-11 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 transition ${bc(passErr, touched.password)}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <ErrPill msg={touched.password ? passErr : null} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-2.5 font-semibold hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 transition-all shadow-md shadow-blue-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <p className="text-sm text-center text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
