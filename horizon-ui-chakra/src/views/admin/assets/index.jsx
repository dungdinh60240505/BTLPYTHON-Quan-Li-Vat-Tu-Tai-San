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
import ColumnsTable from "views/admin/assets/components/ColumnsTable";
import React, { useCallback, useEffect, useState } from "react";

export default function Settings() {

  const [tableData, setTableData] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/api/v1/assets", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Cannot load assets");
      }

      const assets = await res.json();

      setTableData(
        [...assets]
          .sort((a, b) => a.id - b.id)
          .map((item, index) => ({
          ...item,
          stt: index+1,
          code: item.asset_code,
          name: item.name,
          assigned_department_id: item.assigned_department_id,
          assigned_user_id: item.assigned_user_id,
          assigned_department: item.assigned_department?.name || "-",
          assigned_user: item.assigned_user?.name || "-" ,
          created_at: new Date(item.created_at).toLocaleString("vi-VN")
        }))
      );
    } catch ( error ) {
      console.error("Fetch assets failed:", error);
      toast({
        title: "Fetch assets failed",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    const fetchSelectOptions = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const [departmentsRes, usersRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/v1/departments", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }),
          fetch("http://127.0.0.1:8000/api/v1/users", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          }),
        ]);

        if (departmentsRes.ok) {
          const departments = await departmentsRes.json();
          setDepartmentOptions(
            departments.map((item) => ({
              value: String(item.id),
              label: `${item.id} - ${item.name}`,
            }))
          );
        }

        if (usersRes.ok) {
          const users = await usersRes.json();
          setUserOptions(
            users.map((item) => ({
              value: String(item.id),
              label: `${item.id} - ${item.full_name}`,
            }))
          );
        }
      } catch (error) {
        console.error("Fetch asset select options failed:", error);
      }
    };

    fetchSelectOptions();
  }, []);

  const handleSaveAsset = async (asset) => {
    try {
      setSavingId(asset.id);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/v1/assets/${asset.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          asset_code: asset.code.trim(),
          name: asset.name.trim(),
          category: asset.category || null,
          serial_number: asset.serial_number || null,
          specification: asset.specification || null,
          purchase_date: asset.purchase_date || null,
          purchase_cost: asset.purchase_cost ? parseFloat(asset.purchase_cost) : null,
          status: asset.status || null,
          condition: asset.condition || null,
          location: asset.location || null,
          note: asset.note || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Update asset failed");
      }

      await fetchAssets();
      toast({
        title: "Asset updated",
        status: "success",
      });
    } catch (error) {
      console.error("Update asset failed:", error);
      toast({
        title: "Update asset failed",
        status: "error",
      });
      throw error;
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteAsset = async (asset) => {
    try {
      setDeletingId(asset.id);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/v1/assets/${asset.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });

      if (!res.ok) {
        throw new Error("Delete asset failed");
      }

      await fetchAssets();
      toast({
        title: "Asset deleted",
        status: "success",
      });
    } catch (error) {
      console.error("Delete asset failed:", error);
      toast({
        title: "Delete asset failed",
        status: "error",
      });
      throw error;
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateAsset = async (asset) => {
    try {
      setCreating(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/api/v1/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          asset_code: asset.code.trim(),
          name: asset.name.trim(),
          category: asset.category || null,
          serial_number: asset.serial_number || null,
          specification: asset.specification || null,
          purchase_date: asset.purchase_date || null,
          purchase_cost: asset.purchase_cost ? parseFloat(asset.purchase_cost) : null,
          status: asset.status || null,
          condition: asset.condition || null,
          location: asset.location || null,
          note: asset.note || null,
          assigned_department_id: asset.assigned_department_id,
          assigned_user_id: asset.assigned_user_id,
        }),
      });

      if (!res.ok) {
        throw new Error("Create asset failed");
      }

      await fetchAssets();
      toast({
        title: "Asset created",
        status: "success",
      });
    } catch (error) {
      console.error("Create asset failed:", error);
      toast({
        title: "Create asset failed",
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
        departmentOptions={departmentOptions}
        userOptions={userOptions}
        title={ loading ? "Loading..." : "Assets Table"}
        addLabel="Add Asset"
        onCreateAsset={{
          handler: handleCreateAsset,
          loading: creating,
        }}
        onSaveAsset={{
          handler: handleSaveAsset,
          loadingId: savingId,
        }}
        onDeleteAsset={{
          handler: handleDeleteAsset,
          loadingId: deletingId,
        }}
      />
    </Box>
  );
}
