/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _|
 | |_| | | | | |_) || |  / / | | |  \| | | | | || |
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
*/

import { Box, useToast } from "@chakra-ui/react";
import CheckTable from "views/admin/allocations/components/ColumnsTable";
import React, { useCallback, useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

const formatDateTime = (value) => (value ? new Date(value).toLocaleString("vi-VN") : "-");
const formatDate = (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "-");
const getErrorMessage = async (res, fallbackMessage) => {
  try {
    const data = await res.json();
    if (typeof data?.detail === "string" && data.detail.trim()) {
      return data.detail;
    }
  } catch (_) {
    // Ignore invalid JSON responses and use the fallback message.
  }
  return fallbackMessage;
};

export default function Settings() {
  const [tableData, setTableData] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [supplyOptions, setSupplyOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();

  const fetchAllocations = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/allocations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Cannot load allocations");
      }

      const allocations = await res.json();

      setTableData(
        [...allocations]
          .sort((a, b) => a.id - b.id)
          .map((item, index) => ({
            stt: index + 1,
            id: item.id,
            allocation_code: item.allocation_code,
            allocation_type: item.allocation_type,
            status: item.status,
            asset_id: item.asset_id,
            supply_id: item.supply_id,
            quantity: item.quantity,
            allocated_department_id: item.allocated_department_id,
            allocated_user_id: item.allocated_user_id,
            allocated_by_user_id: item.allocated_by_user_id,
            allocated_at_raw: item.allocated_at,
            expected_return_date_raw: item.expected_return_date,
            returned_at_raw: item.returned_at,
            purpose: item.purpose,
            note: item.note,
            created_at_raw: item.created_at,
            updated_at_raw: item.updated_at,
            item_name: item.asset?.name || item.supply?.name || "-",
            item_code: item.asset?.asset_code || item.supply?.supply_code || "-",
            department: item.allocated_department?.name || "-",
            allocated_user: item.allocated_user?.full_name || "-",
            allocated_by_user: item.allocated_by_user?.full_name || "-",
            allocated_at: formatDateTime(item.allocated_at),
            expected_return_date: formatDate(item.expected_return_date),
            returned_at: formatDateTime(item.returned_at),
            created_at: formatDateTime(item.created_at),
            updated_at: formatDateTime(item.updated_at),
          }))
      );
    } catch (error) {
      console.error("Fetch allocations failed:", error);
      toast({
        title: "Fetch allocations failed",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  useEffect(() => {
    const fetchSelectOptions = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const [assetsRes, suppliesRes, departmentsRes, usersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/assets`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/supplies`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/departments`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/users`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (assetsRes.ok) {
          const assets = await assetsRes.json();
          setAssetOptions(
            assets.map((item) => ({
              value: String(item.id),
              label: `${item.id} - ${item.name}`,
            }))
          );
        }

        if (suppliesRes.ok) {
          const supplies = await suppliesRes.json();
          setSupplyOptions(
            supplies
              .filter((item) => Number(item.quantity_in_stock ?? 0) > 0)
              .map((item) => ({
                value: String(item.id),
                label: `${item.id} - ${item.name} (Ton kho: ${item.quantity_in_stock})`,
                quantity_in_stock: Number(item.quantity_in_stock ?? 0),
              }))
          );
        }

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
        console.error("Fetch allocation select options failed:", error);
      }
    };

    fetchSelectOptions();
  }, []);

  const handleSaveAllocation = async (allocation) => {
    try {
      setSavingId(allocation.id);
      const token = localStorage.getItem("access_token");
      const updatePayload = {
        allocated_department_id: allocation.allocated_department_id,
        allocated_user_id: allocation.allocated_user_id,
        expected_return_date: allocation.expected_return_date || null,
        purpose: allocation.purpose || null,
        note: allocation.note || null,
      };

      if (
        allocation.allocation_type === "supply" &&
        allocation.quantity != null &&
        Number(allocation.quantity) !== Number(allocation.original_quantity)
      ) {
        updatePayload.quantity = allocation.quantity;
      }

      const updateRes = await fetch(`${API_BASE_URL}/allocations/${allocation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (!updateRes.ok) {
        throw new Error(await getErrorMessage(updateRes, "Update allocation failed"));
      }

      if (allocation.original_status && allocation.status !== allocation.original_status) {
        const statusRes = await fetch(`${API_BASE_URL}/allocations/${allocation.id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: allocation.status,
            note: allocation.note || null,
          }),
        });

        if (!statusRes.ok) {
          throw new Error(await getErrorMessage(statusRes, "Update allocation status failed"));
        }
      }

      await fetchAllocations();
      toast({
        title: "Allocation updated",
        status: "success",
      });
    } catch (error) {
      console.error("Update allocation failed:", error);
      toast({
        title: "Update allocation failed",
        description: error.message,
        status: "error",
      });
      throw error;
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteAllocation = async (allocation) => {
    try {
      setDeletingId(allocation.id);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/allocations/${allocation.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Delete allocation failed");
      }

      await fetchAllocations();
      toast({
        title: "Allocation deleted",
        status: "success",
      });
    } catch (error) {
      console.error("Delete allocation failed:", error);
      toast({
        title: "Delete allocation failed",
        status: "error",
      });
      throw error;
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateAllocation = async (allocation) => {
    try {
      setCreating(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/allocations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          allocation_code: allocation.allocation_code,
          allocation_type: allocation.allocation_type,
          asset_id: allocation.asset_id,
          supply_id: allocation.supply_id,
          quantity: allocation.quantity,
          allocated_department_id: allocation.allocated_department_id,
          allocated_user_id: allocation.allocated_user_id,
          expected_return_date: allocation.expected_return_date || null,
          purpose: allocation.purpose || null,
          note: allocation.note || null,
        }),
      });

      if (!res.ok) {
        throw new Error(await getErrorMessage(res, "Create allocation failed"));
      }

      await fetchAllocations();
      toast({
        title: "Allocation created",
        status: "success",
      });
    } catch (error) {
      console.error("Create allocation failed:", error);
      toast({
        title: "Create allocation failed",
        description: error.message,
        status: "error",
      });
      throw error;
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <CheckTable
        tableData={tableData}
        assetOptions={assetOptions}
        supplyOptions={supplyOptions}
        departmentOptions={departmentOptions}
        userOptions={userOptions}
        title={loading ? "Loading..." : "Allocations Table"}
        addLabel="Add Allocation"
        onCreateAllocation={{
          handler: handleCreateAllocation,
          loading: creating,
        }}
        onSaveAllocation={{
          handler: handleSaveAllocation,
          loadingId: savingId,
        }}
        onDeleteAllocation={{
          handler: handleDeleteAllocation,
          loadingId: deletingId,
        }}
      />
    </Box>
  );
}
