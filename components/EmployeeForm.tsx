"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Pencil } from "lucide-react";
import api from "@/lib/api";

export interface EmployeeFormData {
  employeeId: string;
  idMode: "auto" | "manual";
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: string;
  joinDate: string;
  address: string;
  status: "active" | "inactive";
}

interface Props {
  initialData?: Partial<EmployeeFormData>;
  /** If true, the employeeId row is shown as a plain read-only display (edit mode) */
  editMode?: boolean;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  loading: boolean;
  submitLabel: string;
  onCancel?: () => void;
}

const DEPARTMENTS = [
  "Engineering", "Marketing", "Sales", "HR",
  "Finance", "Operations", "Design", "Support",
];

export default function EmployeeForm({
  initialData = {},
  editMode = false,
  onSubmit,
  loading,
  submitLabel,
  onCancel,
}: Props) {
  const [form, setForm] = useState<EmployeeFormData>({
    employeeId:  initialData.employeeId  ?? "",
    idMode:      initialData.idMode      ?? "auto",
    name:        initialData.name        ?? "",
    email:       initialData.email       ?? "",
    phone:       initialData.phone       ?? "",
    department:  initialData.department  ?? "",
    designation: initialData.designation ?? "",
    salary:      initialData.salary      ?? "",
    joinDate:    initialData.joinDate ? initialData.joinDate.slice(0, 10) : "",
    address:     initialData.address     ?? "",
    status:      initialData.status      ?? "active",
  });

  const [idLoading,    setIdLoading]    = useState(false);
  const [idError,      setIdError]      = useState<string | null>(null);
  // A counter that increments every time the user clicks "Regenerate".
  // Adding it to the useEffect deps ensures a new fetch fires even when
  // idMode is already "auto" (the value doesn't change, so without this
  // the effect would not re-run).
  const [refreshCount, setRefreshCount] = useState(0);

  // Fetch a fresh preview ID whenever auto-mode is active or the user
  // clicks Regenerate (refreshCount increments).
  useEffect(() => {
    if (editMode || form.idMode !== "auto") return;
    let cancelled = false;
    const fetchPreview = async () => {
      setIdLoading(true);
      setIdError(null);
      setForm(prev => ({ ...prev, employeeId: "" })); // clear old value immediately
      try {
        const res = await api.get("/employees/preview-id");
        if (!cancelled) setForm(prev => ({ ...prev, employeeId: res.data.employeeId }));
      } catch {
        if (!cancelled) setIdError("Could not generate ID – you can type one manually.");
      } finally {
        if (!cancelled) setIdLoading(false);
      }
    };
    fetchPreview();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.idMode, editMode, refreshCount]);

  const change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  // Shared text-input renderer
  const field = (
    label: string,
    name: keyof EmployeeFormData,
    type = "text",
    required = true,
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name] as string}
        onChange={change}
        required={required}
        className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* ── Employee ID section ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">
            Employee ID <span className="text-red-500">*</span>
          </label>

          {/* Only show the toggle in add mode */}
          {!editMode && (
            <div className="flex rounded-lg overflow-hidden border border-blue-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setRefreshCount(0);
                  setForm(p => ({ ...p, idMode: "auto", employeeId: "" }));
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition ${
                  form.idMode === "auto"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <RefreshCw size={12} />
                Auto Generate
              </button>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, idMode: "manual", employeeId: "" }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition ${
                  form.idMode === "manual"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Pencil size={12} />
                Enter Manually
              </button>
            </div>
          )}
        </div>

        {/* Auto mode — show preview badge + refresh button */}
        {!editMode && form.idMode === "auto" && (
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center bg-white border border-blue-200 rounded-lg px-3 py-2.5 min-h-[42px]">
              {idLoading ? (
                /* ── Skeleton loader ── */
                <div className="flex items-center gap-3 w-full">
                  {/* Pulsing circle replaces the green dot */}
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-200 animate-pulse shrink-0" />
                  {/* Pulsing bar replaces the ID text */}
                  <span className="h-3.5 w-36 rounded-full bg-blue-100 animate-pulse" />
                  {/* "Generating…" label on the right */}
                  <span className="ml-auto text-xs text-blue-400 italic flex items-center gap-1.5">
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Generating…
                  </span>
                </div>
              ) : (
                /* ── Resolved state ── */
                <div className="flex items-center gap-1.5 w-full">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <span className="font-mono font-semibold text-blue-700 text-sm tracking-wider">
                    {form.employeeId}
                  </span>
                  <span className="ml-auto text-xs text-gray-400 italic">auto-generated</span>
                </div>
              )}
            </div>

            {/* Refresh / regenerate button */}
            <button
              type="button"
              title="Regenerate ID"
              disabled={idLoading}
              onClick={() => setRefreshCount(c => c + 1)}
              className="p-2.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-100 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw size={15} className={idLoading ? "animate-spin" : ""} />
            </button>
          </div>
        )}

        {/* Manual mode — text input */}
        {!editMode && form.idMode === "manual" && (
          <div className="flex flex-col gap-1">
            <input
              type="text"
              name="employeeId"
              value={form.employeeId}
              onChange={change}
              placeholder="e.g. EMP-2026-00050"
              required
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white uppercase placeholder:normal-case placeholder:font-sans tracking-wider transition"
            />
            <p className="text-xs text-gray-500">
              Must be unique. It will be stored in uppercase.
            </p>
          </div>
        )}

        {/* Edit mode — editable but clearly distinguished */}
        {editMode && (
          <div className="flex flex-col gap-1">
            <div className="relative">
              <input
                type="text"
                name="employeeId"
                value={form.employeeId}
                onChange={change}
                placeholder="Employee ID"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono font-semibold text-gray-800 tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white uppercase placeholder:normal-case placeholder:font-sans transition pr-24"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 italic pointer-events-none">
                editable
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Changing this must remain unique across all employees.
            </p>
          </div>
        )}

        {idError && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            {idError}
          </p>
        )}
      </div>

      {/* ── Rest of the form ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field("Full Name",      "name")}
        {field("Email Address",  "email", "email")}
        {field("Phone",          "phone", "tel")}

        {/* Department */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            name="department"
            value={form.department}
            onChange={change}
            required
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition"
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {field("Designation",    "designation")}
        {field("Salary (₹)",     "salary", "number")}
        {field("Join Date",      "joinDate", "date")}

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={change}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Address – full width */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={change}
            rows={2}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none transition"
          />
        </div>
      </div>

      {/* ── Buttons ─────────────────────────────────────────────────────── */}
      <div className="flex gap-3 justify-end pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition text-sm font-medium"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition text-sm font-medium shadow-sm shadow-blue-200"
        >
          {loading ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
