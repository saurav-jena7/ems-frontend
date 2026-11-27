"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { Users, User, Phone, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

// ── Validation ──────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^(\+91[\s-]?)?[6-9]\d{9}$/;

function validateName(v: string): string | null {
  if (!v.trim()) return "Full name is required";
  if (v.trim().length < 2) return "Name must be at least 2 characters";
  return null;
}
function validatePhone(v: string): string | null {
  const s = v.replace(/[\s-]/g, "");
  if (!s) return "Phone number is required";
  if (!PHONE_REGEX.test(s)) return "Enter a valid 10-digit mobile number (e.g. 9876543210)";
  return null;
}
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

// ── Types ───────────────────────────────────────────────────────────────────
type Field = "name" | "phone" | "email" | "password";
type FS = Record<Field, string>;
type TS = Record<Field, boolean>;
type ES = Record<Field, string | null>;

const EF: FS = { name: "", phone: "", email: "", password: "" };
const ET: TS = { name: false, phone: false, email: false, password: false };
const EE: ES = { name: null, phone: null, email: null, password: null };

const validators: Record<Field, (v: string) => string | null> = {
  name: validateName, phone: validatePhone, email: validateEmail, password: validatePassword,
};

// ── Error pill ──────────────────────────────────────────────────────────────
function ErrPill({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
      <svg className="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
      </svg>
      {msg}
    </p>
  );
}

// ── Component ───────────────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();

  const [form,     setForm]     = useState<FS>(EF);
  const [touched,  setTouched]  = useState<TS>(ET);
  const [errors,   setErrors]   = useState<ES>(EE);
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    setForm(EF); setTouched(ET); setErrors(EE); setShowPass(false);
  }, []);

  const change = (f: Field, v: string) => {
    setForm(p => ({ ...p, [f]: v }));
    if (touched[f]) setErrors(p => ({ ...p, [f]: validators[f](v) }));
  };

  const blur = (f: Field) => {
    setTouched(p => ({ ...p, [f]: true }));
    setErrors(p => ({ ...p, [f]: validators[f](form[f]) }));
  };

  const bc = (f: Field) =>
    touched[f] && errors[f] ? "border-red-400 focus:ring-red-400" : "border-gray-200 focus:ring-blue-500";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ne = {} as ES;
    (Object.keys(validators) as Field[]).forEach(f => { ne[f] = validators[f](form[f]); });
    setErrors(ne);
    setTouched({ name: true, phone: true, email: true, password: true });
    if (Object.values(ne).some(Boolean)) return;

    setLoading(true);
    try {
      const res = await api.post("/auth/signup", {
        name:     form.name.trim(),
        phone:    form.phone.replace(/[\s-]/g, ""),
        email:    form.email.trim(),
        password: form.password,
      });
      saveAuth(res.data.token, res.data.user);
      toast.success("Account created successfully!");
      router.push("/employees");
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.field === "email") {
        setErrors(p => ({ ...p, email: data.message }));
        setTouched(p => ({ ...p, email: true }));
      } else if (data?.field === "phone") {
        setErrors(p => ({ ...p, phone: data.message }));
        setTouched(p => ({ ...p, phone: true }));
      } else {
        toast.error(data?.message || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    /* h-screen + overflow-hidden — the whole page is exactly one viewport tall */
    <div className="h-screen overflow-hidden flex">

      {/* ── Left panel ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[55%] bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 px-10 pt-8 flex items-center gap-3 shrink-0">
          <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
            <Users size={24} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Employee MS</span>
        </div>

        {/* Centre content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 pb-8 gap-7 min-h-0">

          <div className="w-full max-w-xs shrink-0">
            <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl">
              <circle cx="240" cy="180" r="130" fill="white" fillOpacity="0.06"/>
              <circle cx="240" cy="180" r="90"  fill="white" fillOpacity="0.06"/>
              <rect x="150" y="80" width="180" height="130" rx="14" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.4" strokeWidth="2"/>
              <rect x="150" y="80" width="180" height="38" rx="14" fill="white" fillOpacity="0.15"/>
              <rect x="150" y="104" width="180" height="14" fill="white" fillOpacity="0.15"/>
              <circle cx="174" cy="99" r="11" fill="white" fillOpacity="0.4"/>
              <rect x="168" y="94" width="12" height="10" rx="2" fill="white" fillOpacity="0.6"/>
              <rect x="193" y="93" width="80" height="7" rx="3" fill="white" fillOpacity="0.5"/>
              <rect x="193" y="104" width="55" height="5" rx="2.5" fill="white" fillOpacity="0.3"/>
              <circle cx="193" cy="155" r="26" fill="white" fillOpacity="0.3"/>
              <circle cx="193" cy="147" r="12" fill="white" fillOpacity="0.5"/>
              <ellipse cx="193" cy="168" rx="16" ry="10" fill="white" fillOpacity="0.4"/>
              <rect x="228" y="140" width="80" height="7" rx="3" fill="white" fillOpacity="0.5"/>
              <rect x="228" y="153" width="60" height="5" rx="2.5" fill="white" fillOpacity="0.3"/>
              <rect x="228" y="164" width="70" height="5" rx="2.5" fill="white" fillOpacity="0.3"/>
              <rect x="228" y="175" width="50" height="5" rx="2.5" fill="white" fillOpacity="0.25"/>
              <circle cx="316" cy="80" r="22" fill="#4ade80" fillOpacity="0.85"/>
              <path d="M305 80 L312 87 L327 72" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="96" cy="200" r="22" fill="white" fillOpacity="0.3"/>
              <circle cx="88" cy="197" r="2.5" fill="white" fillOpacity="0.7"/>
              <circle cx="104" cy="197" r="2.5" fill="white" fillOpacity="0.7"/>
              <path d="M90 206 Q96 211 102 206" stroke="white" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <ellipse cx="96" cy="237" rx="20" ry="24" fill="white" fillOpacity="0.2"/>
              <circle cx="384" cy="200" r="22" fill="white" fillOpacity="0.3"/>
              <circle cx="376" cy="197" r="2.5" fill="white" fillOpacity="0.7"/>
              <circle cx="392" cy="197" r="2.5" fill="white" fillOpacity="0.7"/>
              <path d="M378 206 Q384 211 390 206" stroke="white" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <ellipse cx="384" cy="237" rx="20" ry="24" fill="white" fillOpacity="0.2"/>
              <line x1="118" y1="237" x2="150" y2="210" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="4 3"/>
              <line x1="330" y1="210" x2="362" y2="237" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="4 3"/>
              <circle cx="150" cy="210" r="4" fill="white" fillOpacity="0.3"/>
              <circle cx="330" cy="210" r="4" fill="white" fillOpacity="0.3"/>
              <circle cx="130" cy="130" r="3" fill="white" fillOpacity="0.5"/>
              <circle cx="350" cy="150" r="3" fill="white" fillOpacity="0.5"/>
              <circle cx="420" cy="120" r="2" fill="white" fillOpacity="0.3"/>
              <circle cx="60"  cy="160" r="2" fill="white" fillOpacity="0.3"/>
              <rect x="150" y="228" width="180" height="10" rx="5" fill="white" fillOpacity="0.15"/>
              <rect x="150" y="228" width="140" height="10" rx="5" fill="white" fillOpacity="0.45"/>
              <circle cx="290" cy="233" r="6" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>

          <div className="text-center shrink-0">
            <h2 className="text-white text-2xl font-bold leading-snug mb-2">
              Join your team<br />in seconds
            </h2>
            <p className="text-blue-200 text-sm max-w-xs mx-auto leading-relaxed">
              Create your account and start managing employees right away.
            </p>
          </div>

          <div className="flex gap-10 shrink-0">
            {[{ value: "Free", label: "To join" }, { value: "Safe", label: "& secure" }, { value: "Fast", label: "Setup" }].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-white font-bold text-base">{s.value}</div>
                <div className="text-blue-300 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — internally scrollable if viewport is very short ─ */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white overflow-y-auto px-6 py-6">

        {/* Mobile brand */}
        <div className="flex lg:hidden items-center gap-2 mb-5 shrink-0">
          <div className="bg-blue-700 text-white p-2 rounded-xl">
            <Users size={22} />
          </div>
          <span className="text-gray-800 font-bold text-xl">Employee MS</span>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-5">Fill in the details to get started</p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">

            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => change("name", e.target.value)}
                  onBlur={() => blur("name")}
                  placeholder="Saurav Kumar"
                  autoComplete="name"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 transition ${bc("name")}`}
                />
              </div>
              <ErrPill msg={touched.name ? errors.name : null} />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => change("phone", e.target.value)}
                  onBlur={() => blur("phone")}
                  placeholder="9876543210"
                  autoComplete="tel"
                  maxLength={13}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 transition ${bc("phone")}`}
                />
              </div>
              <ErrPill msg={touched.phone ? errors.phone : null} />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => change("email", e.target.value)}
                  onBlur={() => blur("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 transition ${bc("email")}`}
                />
              </div>
              <ErrPill msg={touched.email ? errors.email : null} />
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
                  value={form.password}
                  onChange={e => change("password", e.target.value)}
                  onBlur={() => blur("password")}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-11 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 transition ${bc("password")}`}
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
              <ErrPill msg={touched.password ? errors.password : null} />
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
                  Creating account…
                </>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
