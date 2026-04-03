/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
*/

import { Box, useToast } from "@chakra-ui/react";
import CheckTable from "views/admin/supplies/components/ColumnsTable";
import React, { useCallback, useEffect, useState } from "react";

export default function Settings() {
  const [tableData, setTableData] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();

  const fetchSupplies = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/api/v1/supplies", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Cannot load supplies");
      }

      const supplies = await res.json();

      setTableData(
        [...supplies]
          .sort((a, b) => a.id - b.id)
          .map((item, index) => ({
            stt: index + 1,
            id: item.id,
            supply_code: item.supply_code,
            name: item.name,
            category: item.category,
            unit: item.unit,
            quantity_in_stock: item.quantity_in_stock,
            minimum_stock_level: item.minimum_stock_level,
            unit_price: item.unit_price,
            location: item.location,
            description: item.description,
            note: item.note,
            managed_department_id: item.managed_department_id,
            managed_department: item.managed_department?.name,
            is_active: item.is_active ? "Active" : "Inactive",
            is_active_raw: item.is_active,
            created_at: new Date(item.created_at).toLocaleString("vi-VN"),
            updated_at: new Date(item.updated_at).toLocaleString("vi-VN"),
          }))
      );
    } catch (error) {
      console.error("Fetch supplies failed:", error);
      toast({
        title: "Fetch supplies failed",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

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
        console.error("Fetch supply department options failed:", error);
      }
    };

    fetchDepartments();
  }, []);

  const handleSaveSupply = async (supply) => {
    try {
      setSavingId(supply.id);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/v1/supplies/${supply.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          supply_code: supply.supply_code,
          name: supply.name,
          category: supply.category,
          unit: supply.unit,
          quantity_in_stock: supply.quantity_in_stock,
          minimum_stock_level: supply.minimum_stock_level,
          unit_price: supply.unit_price,
          location: supply.location || null,
          description: supply.description || null,
          note: supply.note || null,
          managed_department_id: supply.managed_department_id,
          is_active: supply.is_active,
        }),
      });

      if (!res.ok) {
        throw new Error("Update supply failed");
      }

      await fetchSupplies();
      toast({
        title: "Supply updated",
        status: "success",
      });
    } catch (error) {
      console.error("Update supply failed:", error);
      toast({
        title: "Update supply failed",
        status: "error",
      });
      throw error;
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteSupply = async (supply) => {
    try {
      setDeletingId(supply.id);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/v1/supplies/${supply.id}/deactivate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });

      if (!res.ok) {
        throw new Error("Delete supply failed");
      }

      await fetchSupplies();
      toast({
        title: "Supply deactivated",
        status: "success",
      });
    } catch (error) {
      console.error("Delete supply failed:", error);
      toast({
        title: "Delete supply failed",
        status: "error",
      });
      throw error;
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateSupply = async (supply) => {
    try {
      setCreating(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/api/v1/supplies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          supply_code: supply.supply_code,
          name: supply.name,
          category: supply.category,
          unit: supply.unit,
          quantity_in_stock: supply.quantity_in_stock ?? 0,
          minimum_stock_level: supply.minimum_stock_level ?? 0,
          unit_price: supply.unit_price,
          location: supply.location || null,
          description: supply.description || null,
          note: supply.note || null,
          managed_department_id: supply.managed_department_id,
          is_active: supply.is_active,
        }),
      });

      if (!res.ok) {
        throw new Error("Create supply failed");
      }

      await fetchSupplies();
      toast({
        title: "Supply created",
        status: "success",
      });
    } catch (error) {
      console.error("Create supply failed:", error);
      toast({
        title: "Create supply failed",
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
        departmentOptions={departmentOptions}
        title={loading ? "Loading..." : "Supplies Table"}
        addLabel="Add Supply"
        onCreateSupply={{
          handler: handleCreateSupply,
          loading: creating,
        }}
        onSaveSupply={{
          handler: handleSaveSupply,
          loadingId: savingId,
        }}
        onDeleteSupply={{
          handler: handleDeleteSupply,
          loadingId: deletingId,
        }}
      />
    </Box>
  );
}
