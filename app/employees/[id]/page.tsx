"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Modal from "@/components/Modal";
import EmployeeForm, { EmployeeFormData } from "@/components/EmployeeForm";
import { ArrowLeft, Pencil, Trash2, AlertTriangle } from "lucide-react";

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  joinDate: string;
  address: string;
  status: "active" | "inactive";
  createdAt: string;
}

// ── Skeleton ─────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gray-200 animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="h-5 w-48 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-3 w-32 rounded-full bg-gray-100 animate-pulse" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="grid grid-cols-2 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-3 w-20 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-5 w-36 rounded-full bg-gray-100 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Inner component ───────────────────────────────────────────────────────
function ViewEmployeeInner() {
  const router     = useRouter();
  const { id }     = useParams<{ id: string }>();

  const [employee,    setEmployee]    = useState<Employee | null>(null);
  const [loading,     setLoading]     = useState(true);

  // ── edit modal
  const [editOpen,    setEditOpen]    = useState(false);
  const [editSaving,  setEditSaving]  = useState(false);

  // ── delete modal
  const [deleteOpen,  setDeleteOpen]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  // ── auth guard
  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  // ── fetch employee
  useEffect(() => {
    if (!id) return;
    const fetchEmp = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        setEmployee(res.data.data);
      } catch {
        toast.error("Employee not found");
        router.push("/employees");
      } finally {
        setLoading(false);
      }
    };
    fetchEmp();
  }, [id, router]);

  // ── EDIT submit
  const handleEditSubmit = async (data: EmployeeFormData) => {
    setEditSaving(true);
    try {
      const res = await api.put(`/employees/${id}`, {
        employeeId:  data.employeeId,
        name:        data.name,
        email:       data.email,
        phone:       data.phone,
        department:  data.department,
        designation: data.designation,
        salary:      Number(data.salary),
        joinDate:    data.joinDate,
        address:     data.address,
        status:      data.status,
      });
      // Refresh local state with updated data
      setEmployee(res.data.data);
      toast.success("Employee updated successfully!");
      setEditOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update employee");
    } finally {
      setEditSaving(false);
    }
  };

  // ── DELETE confirm
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await api.delete(`/employees/${id}`);
      toast.success(`${employee?.name} has been deleted`);
      setDeleteOpen(false);
      router.push("/employees");
    } catch {
      toast.error("Failed to delete employee");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageSkeleton />;
  if (!employee) return null;

  // Build initialData for edit form
  const editInitialData: Partial<EmployeeFormData> = {
    employeeId:  employee.employeeId,
    idMode:      "manual" as const,
    name:        employee.name,
    email:       employee.email,
    phone:       employee.phone,
    department:  employee.department,
    designation: employee.designation,
    salary:      String(employee.salary),
    joinDate:    employee.joinDate,
    address:     employee.address,
    status:      employee.status,
  };

  const details = [
    { label: "Employee ID",  value: employee.employeeId || "—", mono: true },
    { label: "Full Name",    value: employee.name },
    { label: "Email",        value: employee.email },
    { label: "Phone",        value: employee.phone },
    { label: "Department",   value: employee.department },
    { label: "Designation",  value: employee.designation },
    { label: "Salary",       value: `₹${Number(employee.salary).toLocaleString("en-IN")}` },
    {
      label: "Join Date",
      value: new Date(employee.joinDate).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      }),
    },
    { label: "Address",  value: employee.address || "—" },
    { label: "Added On", value: new Date(employee.createdAt).toLocaleDateString("en-IN") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/employees"
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-800">{employee.name}</h2>
              {employee.employeeId && (
                <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-2 py-0.5 tracking-wider">
                  {employee.employeeId}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {employee.designation} · {employee.department}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            employee.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}>
            {employee.status}
          </span>
        </div>

        {/* Detail card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {details.map((d) => (
              <div key={d.label}>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {d.label}
                </dt>
                <dd className={`mt-1 text-gray-800 ${
                  "mono" in d && d.mono
                    ? "font-mono font-semibold text-blue-700 tracking-wider"
                    : ""
                }`}>
                  {d.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Action buttons — now open modals */}
        <div className="flex gap-3">
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2.5 rounded-lg hover:bg-yellow-600 active:scale-[0.98] transition text-sm font-medium"
          >
            <Pencil size={16} /> Edit
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 active:scale-[0.98] transition text-sm font-medium"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </main>

      {/* ══ EDIT MODAL ══════════════════════════════════════════════════════ */}
      <Modal
        open={editOpen}
        onClose={() => { if (!editSaving) setEditOpen(false); }}
        title="Edit Employee"
        subtitle={`${employee.name}  ·  ${employee.employeeId}`}
      >
        <EmployeeForm
          key={employee._id}
          initialData={editInitialData}
          editMode={true}
          onSubmit={handleEditSubmit}
          loading={editSaving}
          submitLabel="Save Changes"
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      {/* ══ DELETE CONFIRMATION MODAL ════════════════════════════════════════ */}
      <Modal
        open={deleteOpen}
        onClose={() => { if (!deleting) setDeleteOpen(false); }}
        title="Delete Employee"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center text-center gap-5 py-2">
          {/* Warning icon */}
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={32} className="text-red-500" />
          </div>

          <div>
            <p className="text-gray-800 font-semibold text-base">
              Are you sure you want to delete this employee?
            </p>
            <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl px-5 py-3 text-left">
              <p className="font-semibold text-gray-900">{employee.name}</p>
              <p className="text-sm text-gray-500">
                {employee.designation} · {employee.department}
              </p>
              <span className="inline-block mt-1.5 font-mono text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-2 py-0.5 tracking-wider">
                {employee.employeeId}
              </span>
            </div>
            <p className="mt-3 text-sm text-red-600 font-medium">
              This action is permanent and cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 active:scale-[0.98] transition text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Deleting…
                </>
              ) : (
                <><Trash2 size={15} /> Yes, Delete</>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Default export ────────────────────────────────────────────────────────
export default function ViewEmployeePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ViewEmployeeInner />
    </Suspense>
  );
}
