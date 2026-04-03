/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
*/

import { Box, useToast } from "@chakra-ui/react";
import ColumnsTable from "views/admin/users/components/ColumnsTable";
import React, { useCallback, useEffect, useState } from "react";

export default function Settings() {
  const [tableData, setTableData] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/api/v1/users", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Cannot load users");
      }

      const users = await res.json();

      setTableData(
        [...users]
          .sort((a, b) => a.id - b.id)
          .map((item, index) => ({
            stt: index + 1,
            id: item.id,
            username: item.username,
            email: item.email,
            full_name: item.full_name,
            phone_number: item.phone_number,
            avatar_url: item.avatar_url,
            role: item.role,
            department_id: item.department_id,
            department: item.department?.name,
            is_active: item.is_active ? "Active" : "Inactive",
            is_active_raw: item.is_active,
            created_at: new Date(item.created_at).toLocaleString("vi-VN"),
            updated_at: new Date(item.updated_at).toLocaleString("vi-VN"),
          }))
      );
    } catch (error) {
      console.error("Fetch users failed:", error);
      toast({
        title: "Fetch users failed",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("http://127.0.0.1:8000/api/v1/departments", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          return;
        }

        const departments = await res.json();
        setDepartmentOptions(
          departments.map((item) => ({
            value: String(item.id),
            label: `${item.id} - ${item.name}`,
          }))
        );
      } catch (error) {
        console.error("Fetch user department options failed:", error);
      }
    };

    fetchDepartments();
  }, []);

  const handleSaveUser = async (user) => {
    try {
      setSavingId(user.id);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/v1/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          phone_number: user.phone_number || null,
          role: user.role,
          department_id: user.department_id,
          is_active: user.is_active,
        }),
      });

      if (!res.ok) {
        throw new Error("Update user failed");
      }

      await fetchUsers();
      toast({
        title: "User updated",
        status: "success",
      });
    } catch (error) {
      console.error("Update user failed:", error);
      toast({
        title: "Update user failed",
        status: "error",
      });
      throw error;
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      setDeletingId(user.id);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/v1/users/${user.id}/deactivate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });

      if (!res.ok) {
        throw new Error("Delete user failed");
      }

      await fetchUsers();
      toast({
        title: "User deactivated",
        status: "success",
      });
    } catch (error) {
      console.error("Delete user failed:", error);
      toast({
        title: "Delete user failed",
        status: "error",
      });
      throw error;
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateUser = async (user) => {
    try {
      setCreating(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          phone_number: user.phone_number || null,
          role: user.role,
          department_id: user.department_id,
          password: user.password,
          confirm_password: user.confirm_password,
          is_active: user.is_active,
        }),
      });

      if (!res.ok) {
        throw new Error("Create user failed");
      }

      await fetchUsers();
      toast({
        title: "User created",
        status: "success",
      });
    } catch (error) {
      console.error("Create user failed:", error);
      toast({
        title: "Create user failed",
        status: "error",
      });
      throw error;
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <ColumnsTable
        tableData={tableData}
        departmentOptions={departmentOptions}
        title={loading ? "Loading..." : "Users Table"}
        addLabel="Add User"
        onCreateUser={{
          handler: handleCreateUser,
          loading: creating,
        }}
        onSaveUser={{
          handler: handleSaveUser,
          loadingId: savingId,
        }}
        onDeleteUser={{
          handler: handleDeleteUser,
          loadingId: deletingId,
        }}
      />
    </Box>
  );
}
