/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2023 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// Chakra imports
import { Box, useToast } from "@chakra-ui/react";
import ColumnsTable from "views/admin/departments/components/ColumnsTable";
import React, { useCallback, useEffect, useState } from "react";

export default function Settings() {

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/api/v1/departments", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Cannot load departments");
      }

      const departments = await res.json();

      setTableData(
        [...departments]
          .sort((a, b) => a.id - b.id)
          .map((item, index) => ({
          stt: index+1,
          id: item.id,
          code: item.code,
          name: item.name,
          description: item.description,
          is_active: item.is_active ? "Active" : "Inactive",
          is_active_raw: item.is_active,
          created_at: new Date(item.created_at).toLocaleString("vi-VN"),
          updated_at: new Date(item.updated_at).toLocaleString("vi-VN"),
        }))
      );
    } catch ( error ) {
      console.error("Fetch departments failed:", error);
      toast({
        title: "Fetch departments failed",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSaveDepartment = async (department) => {
    try {
      setSavingId(department.id);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/v1/departments/${department.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: department.code.trim(),
          name: department.name.trim(),
          description: department.description || null,
          is_active: department.is_active,
        }),
      });

      if (!res.ok) {
        throw new Error("Update department failed");
      }

      await fetchDepartments();
      toast({
        title: "Department updated",
        status: "success",
      });
    } catch (error) {
      console.error("Update department failed:", error);
      toast({
        title: "Update department failed",
        status: "error",
      });
      throw error;
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteDepartment = async (department) => {
    try {
      setDeletingId(department.id);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/v1/departments/${department.id}/deactivate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });

      if (!res.ok) {
        throw new Error("Delete department failed");
      }

      await fetchDepartments();
      toast({
        title: "Department deactivated",
        status: "success",
      });
    } catch (error) {
      console.error("Delete department failed:", error);
      toast({
        title: "Delete department failed",
        status: "error",
      });
      throw error;
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateDepartment = async (department) => {
    try {
      setCreating(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/api/v1/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: department.code.trim(),
          name: department.name.trim(),
          description: department.description || null,
          is_active: department.is_active,
        }),
      });

      if (!res.ok) {
        throw new Error("Create department failed");
      }

      await fetchDepartments();
      toast({
        title: "Department created",
        status: "success",
      });
    } catch (error) {
      console.error("Create department failed:", error);
      toast({
        title: "Create department failed",
        status: "error",
      });
      throw error;
    } finally {
      setCreating(false);
    }
  };

  // Chakra Color Mode
  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <ColumnsTable
        tableData={tableData}
        title={ loading ? "Loading..." : "Departments Table"}
        addLabel="Add Department"
        onCreateDepartment={{
          handler: handleCreateDepartment,
          loading: creating,
        }}
        onSaveDepartment={{
          handler: handleSaveDepartment,
          loadingId: savingId,
        }}
        onDeleteDepartment={{
          handler: handleDeleteDepartment,
          loadingId: deletingId,
        }}
      />
    </Box>
  );
}
