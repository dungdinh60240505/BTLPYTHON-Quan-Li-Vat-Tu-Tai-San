import React from "react";
import {
  Badge,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";

const initialFormData = {
  allocation_code: "",
  allocation_type: "asset",
  asset_id: "",
  supply_id: "",
  quantity: "1",
  allocated_department_id: "",
  allocated_user_id: "",
  expected_return_date: "",
  purpose: "",
  note: "",
  is_active: true,
  status: "active",
};

const toDateInputValue = (value) => {
  if (!value || value === "-") return "";
  return String(value).slice(0, 10);
};

const getStatusOptions = (allocationType) => {
  if (allocationType === "asset") {
    return [
      { value: "active", label: "Active" },
      { value: "returned", label: "Returned" },
      { value: "cancelled", label: "Cancelled" },
    ];
  }

  return [
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];
};

export default function AllocationModal(props) {
  const {
    allocation,
    assetOptions = [],
    departmentOptions = [],
    userOptions = [],
    isOpen,
    isSubmitting,
    isDeleting,
    onClose,
    onDelete,
    onSave,
    mode = "edit",
  } = props;
  const isCreateMode = mode === "create";
  const [isEditing, setIsEditing] = React.useState(isCreateMode);
  const modalBg = useColorModeValue("white", "navy.800");
  const readOnlyTextColor = useColorModeValue("secondaryGray.900", "white");
  const readOnlyBorderColor = useColorModeValue("secondaryGray.100", "whiteAlpha.100");
  const readOnlyBg = useColorModeValue("secondaryGray.300", "navy.700");
  const [formData, setFormData] = React.useState(initialFormData);

  React.useEffect(() => {
    if (!isOpen) return;
    if (isCreateMode) {
      setFormData(initialFormData);
      setIsEditing(true);
      return;
    }
    if (!allocation) return;
    setFormData({
      allocation_code: allocation.allocation_code || "",
      allocation_type: allocation.allocation_type || "asset",
      asset_id: allocation.asset_id ?? "",
      supply_id: allocation.supply_id ?? "",
      quantity: allocation.quantity != null ? String(allocation.quantity) : "1",
      allocated_department_id: allocation.allocated_department_id ?? "",
      allocated_user_id: allocation.allocated_user_id ?? "",
      expected_return_date: toDateInputValue(allocation.expected_return_date_raw),
      purpose: allocation.purpose || "",
      note: allocation.note || "",
      is_active: Boolean(allocation.is_active_raw),
      status: allocation.status || "active",
    });
    setIsEditing(false);
  }, [allocation, isCreateMode, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "allocation_type"
        ? {
            asset_id: value === "asset" ? prev.asset_id : "",
            supply_id: value === "supply" ? prev.supply_id : "",
            quantity: value === "asset" ? "1" : prev.quantity || "1",
          }
        : {}),
    }));
  };

  const handleSubmit = async () => {
    try {
      await onSave?.(
        isCreateMode
          ? {
              allocation_code: formData.allocation_code.trim(),
              allocation_type: formData.allocation_type,
              asset_id: formData.allocation_type === "asset" && formData.asset_id !== "" ? Number(formData.asset_id) : null,
              supply_id: formData.allocation_type === "supply" && formData.supply_id !== "" ? Number(formData.supply_id) : null,
              quantity: Number(formData.allocation_type === "asset" ? 1 : formData.quantity || 1),
              allocated_department_id: formData.allocated_department_id === "" ? null : Number(formData.allocated_department_id),
              allocated_user_id: formData.allocated_user_id === "" ? null : Number(formData.allocated_user_id),
              expected_return_date: formData.expected_return_date || null,
              purpose: formData.purpose.trim(),
              note: formData.note.trim(),
              is_active: formData.is_active,
            }
          : {
              id: allocation.id,
              allocation_type: allocation.allocation_type,
              allocated_department_id: formData.allocated_department_id === "" ? null : Number(formData.allocated_department_id),
              allocated_user_id: formData.allocated_user_id === "" ? null : Number(formData.allocated_user_id),
              expected_return_date: formData.expected_return_date || null,
              purpose: formData.purpose.trim(),
              note: formData.note.trim(),
              is_active: formData.is_active,
              quantity: Number(formData.quantity) || 1,
              original_quantity: allocation.quantity != null ? Number(allocation.quantity) : 1,
              status: formData.status,
              original_status: allocation.status,
            }
      );
      if (!isCreateMode) setIsEditing(false);
    } catch (_) {
      // Keep the modal open so the user can see the toast error and adjust the form.
    }
  };

  if (!isCreateMode && !allocation) return null;

  const isAllocationActive = Boolean(allocation?.is_active_raw);
  const readOnlyFieldProps = {
    isReadOnly: true,
    variant: "main",
    color: readOnlyTextColor,
    borderColor: readOnlyBorderColor,
    bg: readOnlyBg,
  };
  const statusOptions = getStatusOptions(formData.allocation_type);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg={modalBg}>
        <ModalHeader>{isCreateMode ? "Add Allocation" : "Allocation Detail"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!isCreateMode && !isEditing && (
            <Badge colorScheme="blue" px="12px" py="6px" borderRadius="full" textTransform="capitalize" fontSize="sm" mb={4}>
              {allocation.status || "-"}
            </Badge>
          )}
          {isCreateMode || isEditing ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {isCreateMode && (
                <>
                  <FormControl isRequired><FormLabel>Allocation Code</FormLabel><Input value={formData.allocation_code} onChange={(e) => handleChange("allocation_code", e.target.value)} /></FormControl>
                  <FormControl isRequired><FormLabel>Allocation Type</FormLabel><Select value={formData.allocation_type} onChange={(e) => handleChange("allocation_type", e.target.value)}><option value="asset">asset</option><option value="supply">supply</option></Select></FormControl>
                  {formData.allocation_type === "asset" ? (
                    <FormControl isRequired>
                      <FormLabel>Asset ID</FormLabel>
                      <Select placeholder="Select asset" value={formData.asset_id} onChange={(e) => handleChange("asset_id", e.target.value)}>
                        {assetOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <>
                      <FormControl isRequired><FormLabel>Supply ID</FormLabel><Input type="number" value={formData.supply_id} onChange={(e) => handleChange("supply_id", e.target.value)} /></FormControl>
                      <FormControl isRequired><FormLabel>Quantity</FormLabel><Input type="number" min="1" value={formData.quantity} onChange={(e) => handleChange("quantity", e.target.value)} /></FormControl>
                    </>
                  )}
                </>
              )}
              {!isCreateMode && (
                <>
                  <FormControl><FormLabel>ID</FormLabel><Input value={allocation.id || ""} {...readOnlyFieldProps} /></FormControl>
                  <FormControl><FormLabel>Allocation Code</FormLabel><Input value={allocation.allocation_code || ""} {...readOnlyFieldProps} /></FormControl>
                  <FormControl><FormLabel>Type</FormLabel><Input value={allocation.allocation_type || ""} {...readOnlyFieldProps} /></FormControl>
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select value={formData.status} onChange={(e) => handleChange("status", e.target.value)}>
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl><FormLabel>Item Code</FormLabel><Input value={allocation.item_code || ""} {...readOnlyFieldProps} /></FormControl>
                  <FormControl><FormLabel>Item Name</FormLabel><Input value={allocation.item_name || ""} {...readOnlyFieldProps} /></FormControl>
                  <FormControl><FormLabel>Quantity</FormLabel>{allocation.allocation_type === "supply" ? <Input type="number" min="1" value={formData.quantity} onChange={(e) => handleChange("quantity", e.target.value)} /> : <Input value={allocation.quantity ?? ""} {...readOnlyFieldProps} />}</FormControl>
                  <FormControl><FormLabel>Department</FormLabel><Input value={allocation.department || ""} {...readOnlyFieldProps} /></FormControl>
                </>
              )}
              <FormControl>
                <FormLabel>Allocated Department ID</FormLabel>
                <Select placeholder="Select department" value={formData.allocated_department_id} onChange={(e) => handleChange("allocated_department_id", e.target.value)}>
                  {departmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Allocated User ID</FormLabel>
                <Select placeholder="Select user" value={formData.allocated_user_id} onChange={(e) => handleChange("allocated_user_id", e.target.value)}>
                  {userOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              {!isCreateMode && (
                <>
                  <FormControl><FormLabel>Allocated User</FormLabel><Input value={allocation.allocated_user || ""} {...readOnlyFieldProps} /></FormControl>
                  <FormControl><FormLabel>Allocated By</FormLabel><Input value={allocation.allocated_by_user || ""} {...readOnlyFieldProps} /></FormControl>
                  <FormControl><FormLabel>Allocated By User ID</FormLabel><Input value={allocation.allocated_by_user_id ?? ""} {...readOnlyFieldProps} /></FormControl>
                  <FormControl><FormLabel>Allocated At</FormLabel><Input value={allocation.allocated_at || ""} {...readOnlyFieldProps} /></FormControl>
                  <FormControl><FormLabel>Returned At</FormLabel><Input value={allocation.returned_at || ""} {...readOnlyFieldProps} /></FormControl>
                  <FormControl><FormLabel>Created At</FormLabel><Input value={allocation.created_at || ""} {...readOnlyFieldProps} /></FormControl>
                  <FormControl><FormLabel>Updated At</FormLabel><Input value={allocation.updated_at || ""} {...readOnlyFieldProps} /></FormControl>
                </>
              )}
              <FormControl gridColumn={{ base: "1 / -1", md: "1 / -1" }}>
                <FormLabel>Expected Return Date</FormLabel>
                <Input type="date" value={formData.expected_return_date} onChange={(e) => handleChange("expected_return_date", e.target.value)} />
              </FormControl>
              <FormControl gridColumn={{ base: "1 / -1", md: "1 / -1" }}>
                <FormLabel>Purpose</FormLabel>
                <Textarea value={formData.purpose} onChange={(e) => handleChange("purpose", e.target.value)} rows={3} />
              </FormControl>
              <FormControl gridColumn={{ base: "1 / -1", md: "1 / -1" }}>
                <FormLabel>Note</FormLabel>
                <Textarea value={formData.note} onChange={(e) => handleChange("note", e.target.value)} rows={3} />
              </FormControl>
              <FormControl display="flex" alignItems="center" gap={3} gridColumn={{ base: "1 / -1", md: "1 / -1" }}>
                <FormLabel mb="0">Active</FormLabel>
                <Switch isChecked={formData.is_active} onChange={(e) => handleChange("is_active", e.target.checked)} />
              </FormControl>
            </SimpleGrid>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl><FormLabel>ID</FormLabel><Input value={allocation.id || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Allocation Code</FormLabel><Input value={allocation.allocation_code || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Type</FormLabel><Input value={allocation.allocation_type || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Status</FormLabel><Input value={allocation.status || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Item Code</FormLabel><Input value={allocation.item_code || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Item Name</FormLabel><Input value={allocation.item_name || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Quantity</FormLabel><Input value={allocation.quantity ?? ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Department</FormLabel><Input value={allocation.department || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Allocated Department ID</FormLabel><Input value={allocation.allocated_department_id ?? ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Allocated User</FormLabel><Input value={allocation.allocated_user || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Allocated User ID</FormLabel><Input value={allocation.allocated_user_id ?? ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Allocated By</FormLabel><Input value={allocation.allocated_by_user || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Allocated By User ID</FormLabel><Input value={allocation.allocated_by_user_id ?? ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Allocated At</FormLabel><Input value={allocation.allocated_at || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Expected Return Date</FormLabel><Input value={allocation.expected_return_date || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Returned At</FormLabel><Input value={allocation.returned_at || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Created At</FormLabel><Input value={allocation.created_at || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Updated At</FormLabel><Input value={allocation.updated_at || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl gridColumn={{ base: "1 / -1", md: "1 / -1" }}><FormLabel>Purpose</FormLabel><Textarea value={allocation.purpose || ""} {...readOnlyFieldProps} rows={3} /></FormControl>
              <FormControl gridColumn={{ base: "1 / -1", md: "1 / -1" }}><FormLabel>Note</FormLabel><Textarea value={allocation.note || ""} {...readOnlyFieldProps} rows={3} /></FormControl>
            </SimpleGrid>
          )}
        </ModalBody>
        <ModalFooter gap={3}>
          {isCreateMode ? (
            <><Button variant="ghost" onClick={onClose}>Cancel</Button><Button colorScheme="blue" onClick={handleSubmit} isLoading={isSubmitting}>Save</Button></>
          ) : isEditing ? (
            <><Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button><Button colorScheme="blue" onClick={handleSubmit} isLoading={isSubmitting}>Save</Button></>
          ) : (
            <><Button colorScheme="red" variant="outline" onClick={() => onDelete?.(allocation)} isLoading={isDeleting}>Delete</Button><Button colorScheme="blue" onClick={() => setIsEditing(true)}>Edit</Button></>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
