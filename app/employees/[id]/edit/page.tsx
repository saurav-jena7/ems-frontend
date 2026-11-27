"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import EmployeeForm, { EmployeeFormData } from "@/components/EmployeeForm";
import { ArrowLeft } from "lucide-react";

// ── Skeleton ──────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gray-200 animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="h-5 w-40 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-3 w-28 rounded-full bg-gray-100 animate-pulse" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-3 w-24 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ── Inner component — safe to call useParams() here ──────────────────────
function EditEmployeeInner() {
  const router  = useRouter();
  const { id }  = useParams<{ id: string }>();

  const [initialData, setInitialData] = useState<Partial<EmployeeFormData> | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [fetching,    setFetching]    = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  useEffect(() => {
    if (!id) return;
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        const emp = res.data.data;
        setInitialData({
          employeeId:  emp.employeeId,
          idMode:      "manual" as const,
          name:        emp.name,
          email:       emp.email,
          phone:       emp.phone,
          department:  emp.department,
          designation: emp.designation,
          salary:      String(emp.salary),
          joinDate:    emp.joinDate,
          address:     emp.address,
          status:      emp.status,
        });
      } catch {
        toast.error("Employee not found");
        router.push("/employees");
      } finally {
        setFetching(false);
      }
    };
    fetchEmployee();
  }, [id, router]);

  const handleSubmit = async (data: EmployeeFormData) => {
    setSaving(true);
    try {
      await api.put(`/employees/${id}`, {
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
      toast.success("Employee updated successfully!");
      router.push(`/employees/${id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update employee");
    } finally {
      setSaving(false);
    }
  };

  if (fetching) return <PageSkeleton />;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">

        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/employees/${id}`}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Edit Employee</h2>
            <p className="text-sm text-gray-500">Update the employee details below</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {initialData && (
            <EmployeeForm
              initialData={initialData}
              editMode={true}
              onSubmit={handleSubmit}
              loading={saving}
              submitLabel="Save Changes"
              onCancel={() => router.push(`/employees/${id}`)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// ── Default export ────────────────────────────────────────────────────────
export default function EditEmployeePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EditEmployeeInner />
    </Suspense>
  );
}
