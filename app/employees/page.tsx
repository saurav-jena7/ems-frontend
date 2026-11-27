"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Modal from "@/components/Modal";
import EmployeeForm, { EmployeeFormData } from "@/components/EmployeeForm";
import {
  Search, PlusCircle, Pencil, Trash2, Eye,
  ChevronLeft, ChevronRight, AlertTriangle,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
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
}

interface Pagination { total: number; page: number; pages: number; }

// ── Component ────────────────────────────────────────────────────────────────
export default function EmployeesPage() {
  const router = useRouter();

  // ── list state
  const [employees,       setEmployees]       = useState<Employee[]>([]);
  const [pagination,      setPagination]      = useState<Pagination>({ total: 0, page: 1, pages: 1 });
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page,            setPage]            = useState(1);
  const [listLoading,     setListLoading]     = useState(true);

  // ── add modal
  const [addOpen,  setAddOpen]  = useState(false);
  const [addSaving, setAddSaving] = useState(false);

  // ── edit modal
  const [editOpen,    setEditOpen]    = useState(false);
  const [editTarget,  setEditTarget]  = useState<Employee | null>(null);
  const [editSaving,  setEditSaving]  = useState(false);
  const [editLoading, setEditLoading] = useState(false); // fetching full record

  // ── delete modal
  const [deleteOpen,   setDeleteOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  // ── auth guard
  useEffect(() => { if (!isAuthenticated()) router.push("/login"); }, [router]);

  // ── debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── fetch list
  const fetchEmployees = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await api.get("/employees", {
        params: { search: debouncedSearch, page, limit: 8 },
      });
      setEmployees(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setListLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // ── ADD ──────────────────────────────────────────────────────────────────
  const handleAddSubmit = async (data: EmployeeFormData) => {
    setAddSaving(true);
    try {
      await api.post("/employees", {
        employeeId:  data.employeeId,
        idMode:      data.idMode,
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
      setAddOpen(false);
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add employee");
    } finally {
      setAddSaving(false);
    }
  };

  // ── EDIT — open modal & fetch full record ─────────────────────────────────
  const openEditModal = async (emp: Employee) => {
    setEditOpen(true);
    setEditTarget(null);
    setEditLoading(true);
    try {
      // Fetch the full record (includes address, joinDate etc.)
      const res = await api.get(`/employees/${emp._id}`);
      setEditTarget(res.data.data);
    } catch {
      toast.error("Could not load employee data");
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditSubmit = async (data: EmployeeFormData) => {
    if (!editTarget) return;
    setEditSaving(true);
    try {
      await api.put(`/employees/${editTarget._id}`, {
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
      setEditOpen(false);
      setEditTarget(null);
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update employee");
    } finally {
      setEditSaving(false);
    }
  };

  // ── DELETE — open confirmation modal ─────────────────────────────────────
  const openDeleteModal = (emp: Employee) => {
    setDeleteTarget(emp);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/employees/${deleteTarget._id}`);
      toast.success(`${deleteTarget.name} has been deleted`);
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchEmployees();
    } catch {
      toast.error("Failed to delete employee");
    } finally {
      setDeleting(false);
    }
  };

  // ── Build initialData for the edit form ───────────────────────────────────
  const editInitialData: Partial<EmployeeFormData> | undefined = editTarget
    ? {
        employeeId:  editTarget.employeeId,
        idMode:      "manual" as const,
        name:        editTarget.name,
        email:       editTarget.email,
        phone:       editTarget.phone,
        department:  editTarget.department,
        designation: editTarget.designation,
        salary:      String(editTarget.salary),
        joinDate:    editTarget.joinDate,
        address:     (editTarget as any).address ?? "",
        status:      editTarget.status,
      }
    : undefined;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Employees</h2>
            <p className="text-sm text-gray-500">
              {pagination.total} total employee{pagination.total !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 active:scale-[0.98] transition text-sm font-medium shadow-sm shadow-blue-200"
          >
            <PlusCircle size={18} />
            Add Employee
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Emp ID","Name","Department","Designation","Phone","Salary","Status","Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {listLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Loading employees…
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <p className="font-medium text-gray-500">No employees found</p>
                      <p className="text-xs text-gray-400">Click "Add Employee" to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-blue-50/30 transition">
                    <td className="px-5 py-3.5">
                      <span className="inline-block font-mono text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-2 py-0.5 tracking-wider">
                        {emp.employeeId || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-800">{emp.name}</div>
                      <div className="text-xs text-gray-500">{emp.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{emp.department}</td>
                    <td className="px-5 py-3.5 text-gray-700">{emp.designation}</td>
                    <td className="px-5 py-3.5 text-gray-700">{emp.phone}</td>
                    <td className="px-5 py-3.5 text-gray-700">
                      ₹{Number(emp.salary).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        emp.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {/* View */}
                        <Link
                          href={`/employees/${emp._id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
                        {/* Edit → modal */}
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        {/* Delete → modal */}
                        <button
                          onClick={() => openDeleteModal(emp)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-5">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════
          ADD EMPLOYEE MODAL
      ══════════════════════════════════════════════ */}
      <Modal
        open={addOpen}
        onClose={() => { if (!addSaving) setAddOpen(false); }}
        title="Add New Employee"
        subtitle="Fill in the details below to add a new employee record"
      >
        <EmployeeForm
          onSubmit={handleAddSubmit}
          loading={addSaving}
          submitLabel="Add Employee"
          onCancel={() => setAddOpen(false)}
        />
      </Modal>

      {/* ══════════════════════════════════════════════
          EDIT EMPLOYEE MODAL
      ══════════════════════════════════════════════ */}
      <Modal
        open={editOpen}
        onClose={() => { if (!editSaving) { setEditOpen(false); setEditTarget(null); } }}
        title="Edit Employee"
        subtitle={editTarget ? `Editing — ${editTarget.name} (${editTarget.employeeId})` : "Loading employee…"}
      >
        {/* Skeleton while fetching the full record */}
        {editLoading ? (
          <div className="flex flex-col gap-4 py-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-3 w-24 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
              </div>
            ))}
          </div>
        ) : editInitialData ? (
          <EmployeeForm
            key={editTarget?._id}          /* remount form when target changes */
            initialData={editInitialData}
            editMode={true}
            onSubmit={handleEditSubmit}
            loading={editSaving}
            submitLabel="Save Changes"
            onCancel={() => { setEditOpen(false); setEditTarget(null); }}
          />
        ) : null}
      </Modal>

      {/* ══════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ══════════════════════════════════════════════ */}
      <Modal
        open={deleteOpen}
        onClose={() => { if (!deleting) { setDeleteOpen(false); setDeleteTarget(null); } }}
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
            {deleteTarget && (
              <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl px-5 py-3 text-left">
                <p className="font-semibold text-gray-900">{deleteTarget.name}</p>
                <p className="text-sm text-gray-500">{deleteTarget.designation} · {deleteTarget.department}</p>
                <span className="inline-block mt-1.5 font-mono text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-2 py-0.5 tracking-wider">
                  {deleteTarget.employeeId}
                </span>
              </div>
            )}
            <p className="mt-3 text-sm text-red-600 font-medium">
              This action is permanent and cannot be undone.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={() => { setDeleteOpen(false); setDeleteTarget(null); }}
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
                <>
                  <Trash2 size={15} />
                  Yes, Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
