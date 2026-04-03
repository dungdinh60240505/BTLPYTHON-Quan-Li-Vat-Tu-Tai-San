/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _|
 | |_| | | | | |_) || |  / / | | |  \| | | | | || |
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
*/

import { Box, useToast } from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";

import ColumnsTable from "views/admin/maintenances/components/ColumnsTable";

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

export default function Maintenances() {
  const [tableData, setTableData] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();

  const fetchMaintenances = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/maintenances`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Cannot load maintenances");
      }

      const maintenances = await res.json();

      setTableData(
        [...maintenances]
          .sort((a, b) => a.id - b.id)
          .map((item, index) => ({
            stt: index + 1,
            id: item.id,
            maintenance_code: item.maintenance_code,
            asset_id: item.asset_id,
            maintenance_type: item.maintenance_type,
            status: item.status,
            priority: item.priority,
            title: item.title,
            description: item.description,
            scheduled_date_raw: item.scheduled_date,
            next_maintenance_date_raw: item.next_maintenance_date,
            started_at_raw: item.started_at,
            completed_at_raw: item.completed_at,
            cost: item.cost,
            vendor_name: item.vendor_name,
            resolution_note: item.resolution_note,
            reported_by_user_id: item.reported_by_user_id,
            assigned_to_user_id: item.assigned_to_user_id,
            is_active_raw: item.is_active,
            created_at_raw: item.created_at,
            updated_at_raw: item.updated_at,
            asset_name: item.asset?.name || "-",
            asset_code: item.asset?.asset_code || "-",
            reported_by_user: item.reported_by_user?.full_name || "-",
            assigned_to_user: item.assigned_to_user?.full_name || "-",
            scheduled_date: formatDate(item.scheduled_date),
            next_maintenance_date: formatDate(item.next_maintenance_date),
            started_at: formatDateTime(item.started_at),
            completed_at: formatDateTime(item.completed_at),
            created_at: formatDateTime(item.created_at),
            updated_at: formatDateTime(item.updated_at),
          }))
      );
    } catch (error) {
      console.error("Fetch maintenances failed:", error);
      toast({
        title: "Fetch maintenances failed",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMaintenances();
  }, [fetchMaintenances]);

  useEffect(() => {
    const fetchSelectOptions = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const [assetsRes, usersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/assets`, {
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
              label: `${item.id} - ${item.asset_code} - ${item.name}`,
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
        console.error("Fetch maintenance select options failed:", error);
      }
    };

    fetchSelectOptions();
  }, []);

  const handleSaveMaintenance = async (maintenance) => {
    try {
      setSavingId(maintenance.id);
      const token = localStorage.getItem("access_token");
      const updatePayload = {
        maintenance_code: maintenance.maintenance_code,
        maintenance_type: maintenance.maintenance_type,
        priority: maintenance.priority,
        title: maintenance.title,
        description: maintenance.description || null,
        scheduled_date: maintenance.scheduled_date || null,
        next_maintenance_date: maintenance.next_maintenance_date || null,
        cost: maintenance.cost,
        vendor_name: maintenance.vendor_name || null,
        resolution_note: maintenance.resolution_note || null,
        assigned_to_user_id: maintenance.assigned_to_user_id,
        is_active: maintenance.is_active,
      };

      const updateRes = await fetch(`${API_BASE_URL}/maintenances/${maintenance.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (!updateRes.ok) {
        throw new Error(await getErrorMessage(updateRes, "Update maintenance failed"));
      }

      if (maintenance.original_status && maintenance.status !== maintenance.original_status) {
        const statusRes = await fetch(`${API_BASE_URL}/maintenances/${maintenance.id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: maintenance.status,
            resolution_note: maintenance.resolution_note || null,
            cost: maintenance.cost,
            next_maintenance_date: maintenance.next_maintenance_date || null,
          }),
        });

        if (!statusRes.ok) {
          throw new Error(await getErrorMessage(statusRes, "Update maintenance status failed"));
        }
      }

      await fetchMaintenances();
      toast({
        title: "Maintenance updated",
        status: "success",
      });
    } catch (error) {
      console.error("Update maintenance failed:", error);
      toast({
        title: "Update maintenance failed",
        description: error.message,
        status: "error",
      });
      throw error;
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteMaintenance = async (maintenance) => {
    try {
      setDeletingId(maintenance.id);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/maintenances/${maintenance.id}/deactivate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(await getErrorMessage(res, "Delete maintenance failed"));
      }

      await fetchMaintenances();
      toast({
        title: "Maintenance deactivated",
        status: "success",
      });
    } catch (error) {
      console.error("Delete maintenance failed:", error);
      toast({
        title: "Delete maintenance failed",
        description: error.message,
        status: "error",
      });
      throw error;
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateMaintenance = async (maintenance) => {
    try {
      setCreating(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/maintenances`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          maintenance_code: maintenance.maintenance_code,
          asset_id: maintenance.asset_id,
          maintenance_type: maintenance.maintenance_type,
          status: maintenance.status,
          priority: maintenance.priority,
          title: maintenance.title,
          description: maintenance.description || null,
          scheduled_date: maintenance.scheduled_date || null,
          next_maintenance_date: maintenance.next_maintenance_date || null,
          cost: maintenance.cost,
          vendor_name: maintenance.vendor_name || null,
          resolution_note: maintenance.resolution_note || null,
          assigned_to_user_id: maintenance.assigned_to_user_id,
          is_active: maintenance.is_active,
        }),
      });

      if (!res.ok) {
        throw new Error(await getErrorMessage(res, "Create maintenance failed"));
      }

      await fetchMaintenances();
      toast({
        title: "Maintenance created",
        status: "success",
      });
    } catch (error) {
      console.error("Create maintenance failed:", error);
      toast({
        title: "Create maintenance failed",
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
      <ColumnsTable
        tableData={tableData}
        assetOptions={assetOptions}
        userOptions={userOptions}
        title={loading ? "Loading..." : "Maintenances Table"}
        addLabel="Add Maintenance"
        onCreateMaintenance={{
          handler: handleCreateMaintenance,
          loading: creating,
        }}
        onSaveMaintenance={{
          handler: handleSaveMaintenance,
          loadingId: savingId,
        }}
        onDeleteMaintenance={{
          handler: handleDeleteMaintenance,
          loadingId: deletingId,
        }}
      />
    </Box>
  );
}
