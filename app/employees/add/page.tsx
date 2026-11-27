"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import EmployeeForm, { EmployeeFormData } from "@/components/EmployeeForm";
import { ArrowLeft } from "lucide-react";

export default function AddEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [router]);

  const handleSubmit = async (data: EmployeeFormData) => {
    setLoading(true);
    try {
      await api.post("/employees", {
        employeeId: data.employeeId,
        idMode:     data.idMode,
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
      toast.success("Employee added successfully!");
      router.push("/employees");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/employees"
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Add Employee</h2>
            <p className="text-sm text-gray-500">Fill in the details below</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <EmployeeForm
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Add Employee"
            onCancel={() => router.push("/employees")}
          />
        </div>
      </main>
    </div>
  );
}
