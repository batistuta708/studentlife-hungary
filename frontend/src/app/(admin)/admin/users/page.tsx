"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import type { User, Role } from "@/types";

const roleVariant: Record<Role, "blue" | "orange" | "neutral"> = {
  student: "neutral",
  editor: "blue",
  admin: "orange",
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => adminApi.listUsers({ limit: 100 }).then((res) => setUsers(res.data));

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (id: string, role: Role) => {
    await adminApi.updateUserRole(id, role);
    load();
  };

  const handleToggleActive = async (id: string) => {
    await adminApi.toggleUserActive(id);
    load();
  };

  const columns: Column<User>[] = [
    { header: "Name", accessor: (u) => u.name },
    { header: "Email", accessor: (u) => u.email },
    {
      header: "Role",
      accessor: (u) => (
        <select
          value={u.role}
          onChange={(e) => handleRoleChange(u._id, e.target.value as Role)}
          className="rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs dark:border-slate-700"
        >
          <option value="student">student</option>
          <option value="editor">editor</option>
          <option value="admin">admin</option>
        </select>
      ),
    },
    {
      header: "Status",
      accessor: (u) => <Badge variant={u.isActive === false ? "danger" : "success"}>{u.isActive === false ? "Inactive" : "Active"}</Badge>,
    },
    { header: "Joined", accessor: (u) => new Date(u.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Manage Users</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Change roles or deactivate accounts. Role changes take effect on the user's next request.
      </p>

      <div className="mt-6">
        <DataTable
          columns={columns}
          rows={users}
          loading={loading}
          rowKey={(u) => u._id}
          actions={(u) => (
            <button onClick={() => handleToggleActive(u._id)} className="text-xs font-medium text-brand-blue">
              {u.isActive === false ? "Activate" : "Deactivate"}
            </button>
          )}
        />
      </div>
    </div>
  );
}
