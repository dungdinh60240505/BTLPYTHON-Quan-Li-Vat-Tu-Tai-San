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
  maintenance_code: "",
  asset_id: "",
  maintenance_type: "corrective",
  status: "scheduled",
  priority: "medium",
  title: "",
  description: "",
  scheduled_date: "",
  next_maintenance_date: "",
  cost: "",
  vendor_name: "",
  resolution_note: "",
  assigned_to_user_id: "",
  is_active: true,
};

const toDateInputValue = (value) => {
  if (!value || value === "-") return "";
  return String(value).slice(0, 10);
};

const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const typeOptions = [
  { value: "preventive", label: "Preventive" },
  { value: "corrective", label: "Corrective" },
  { value: "inspection", label: "Inspection" },
  { value: "warranty", label: "Warranty" },
  { value: "other", label: "Other" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function MaintenanceModal(props) {
  const {
    maintenance,
    assetOptions = [],
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
    if (!maintenance) return;
    setFormData({
      maintenance_code: maintenance.maintenance_code || "",
      asset_id: maintenance.asset_id ?? "",
      maintenance_type: maintenance.maintenance_type || "corrective",
      status: maintenance.status || "scheduled",
      priority: maintenance.priority || "medium",
      title: maintenance.title || "",
      description: maintenance.description || "",
      scheduled_date: toDateInputValue(maintenance.scheduled_date_raw),
      next_maintenance_date: toDateInputValue(maintenance.next_maintenance_date_raw),
      cost: maintenance.cost ?? "",
      vendor_name: maintenance.vendor_name || "",
      resolution_note: maintenance.resolution_note || "",
      assigned_to_user_id: maintenance.assigned_to_user_id ?? "",
      is_active: Boolean(maintenance.is_active_raw),
    });
    setIsEditing(false);
  }, [maintenance, isCreateMode, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await onSave?.(
        isCreateMode
          ? {
              maintenance_code: formData.maintenance_code.trim(),
              asset_id: formData.asset_id === "" ? null : Number(formData.asset_id),
              maintenance_type: formData.maintenance_type,
              status: formData.status,
              priority: formData.priority,
              title: formData.title.trim(),
              description: formData.description.trim(),
              scheduled_date: formData.scheduled_date || null,
              next_maintenance_date: formData.next_maintenance_date || null,
              cost: formData.cost === "" ? null : Number(formData.cost),
              vendor_name: formData.vendor_name.trim(),
              resolution_note: formData.resolution_note.trim(),
              assigned_to_user_id: formData.assigned_to_user_id === "" ? null : Number(formData.assigned_to_user_id),
              is_active: formData.is_active,
            }
          : {
              id: maintenance.id,
              maintenance_code: formData.maintenance_code.trim(),
              maintenance_type: formData.maintenance_type,
              priority: formData.priority,
              title: formData.title.trim(),
              description: formData.description.trim(),
              scheduled_date: formData.scheduled_date || null,
              next_maintenance_date: formData.next_maintenance_date || null,
              cost: formData.cost === "" ? null : Number(formData.cost),
              vendor_name: formData.vendor_name.trim(),
              resolution_note: formData.resolution_note.trim(),
              assigned_to_user_id: formData.assigned_to_user_id === "" ? null : Number(formData.assigned_to_user_id),
              is_active: formData.is_active,
              status: formData.status,
              original_status: maintenance.status,
            }
      );
      if (!isCreateMode) setIsEditing(false);
    } catch (_) {
      // Keep modal open so the user can read the toast and adjust the form.
    }
  };

  if (!isCreateMode && !maintenance) return null;

  const readOnlyFieldProps = {
    isReadOnly: true,
    variant: "main",
    color: readOnlyTextColor,
    borderColor: readOnlyBorderColor,
    bg: readOnlyBg,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg={modalBg}>
        <ModalHeader>{isCreateMode ? "Add Maintenance" : "Maintenance Detail"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!isCreateMode && !isEditing && (
            <Badge colorScheme="blue" px="12px" py="6px" borderRadius="full" textTransform="capitalize" fontSize="sm" mb={4}>
              {maintenance.status || "-"}
            </Badge>
          )}
          {isCreateMode || isEditing ? (
            <Stack spacing={4}>
              {isCreateMode ? (
                <>
                  <FormControl isRequired>
                    <FormLabel>Maintenance Code</FormLabel>
                    <Input value={formData.maintenance_code} onChange={(e) => handleChange("maintenance_code", e.target.value)} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Asset</FormLabel>
                    <Select placeholder="Select asset" value={formData.asset_id} onChange={(e) => handleChange("asset_id", e.target.value)}>
                      {assetOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl><FormLabel>ID</FormLabel><Input value={maintenance.id || ""} {...readOnlyFieldProps} /></FormControl>
                  <FormControl><FormLabel>Asset</FormLabel><Input value={maintenance.asset_name || ""} {...readOnlyFieldProps} /></FormControl>
                </SimpleGrid>
              )}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Type</FormLabel>
                  <Select value={formData.maintenance_type} onChange={(e) => handleChange("maintenance_type", e.target.value)}>
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Status</FormLabel>
                  <Select value={formData.status} onChange={(e) => handleChange("status", e.target.value)}>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Priority</FormLabel>
                  <Select value={formData.priority} onChange={(e) => handleChange("priority", e.target.value)}>
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Assigned User</FormLabel>
                  <Select placeholder="Select user" value={formData.assigned_to_user_id} onChange={(e) => handleChange("assigned_to_user_id", e.target.value)}>
                    {userOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input value={formData.title} onChange={(e) => handleChange("title", e.target.value)} />
              </FormControl>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Scheduled Date</FormLabel>
                  <Input type="date" value={formData.scheduled_date} onChange={(e) => handleChange("scheduled_date", e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Next Maintenance Date</FormLabel>
                  <Input type="date" value={formData.next_maintenance_date} onChange={(e) => handleChange("next_maintenance_date", e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Cost</FormLabel>
                  <Input type="number" min="0" value={formData.cost} onChange={(e) => handleChange("cost", e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Vendor Name</FormLabel>
                  <Input value={formData.vendor_name} onChange={(e) => handleChange("vendor_name", e.target.value)} />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} />
              </FormControl>
              <FormControl>
                <FormLabel>Resolution Note</FormLabel>
                <Textarea value={formData.resolution_note} onChange={(e) => handleChange("resolution_note", e.target.value)} rows={3} />
              </FormControl>
              <FormControl display="flex" alignItems="center" gap={3}>
                <FormLabel mb="0">Active</FormLabel>
                <Switch isChecked={formData.is_active} onChange={(e) => handleChange("is_active", e.target.checked)} />
              </FormControl>
            </Stack>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl><FormLabel>ID</FormLabel><Input value={maintenance.id || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Maintenance Code</FormLabel><Input value={maintenance.maintenance_code || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Asset</FormLabel><Input value={maintenance.asset_name || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Asset Code</FormLabel><Input value={maintenance.asset_code || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Type</FormLabel><Input value={maintenance.maintenance_type || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Status</FormLabel><Input value={maintenance.status || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Priority</FormLabel><Input value={maintenance.priority || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Title</FormLabel><Input value={maintenance.title || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Assigned User</FormLabel><Input value={maintenance.assigned_to_user || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Reported By</FormLabel><Input value={maintenance.reported_by_user || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Scheduled Date</FormLabel><Input value={maintenance.scheduled_date || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Next Maintenance Date</FormLabel><Input value={maintenance.next_maintenance_date || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Started At</FormLabel><Input value={maintenance.started_at || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Completed At</FormLabel><Input value={maintenance.completed_at || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Created At</FormLabel><Input value={maintenance.created_at || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Updated At</FormLabel><Input value={maintenance.updated_at || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Cost</FormLabel><Input value={maintenance.cost ?? ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Vendor Name</FormLabel><Input value={maintenance.vendor_name || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl gridColumn={{ base: "1 / -1", md: "1 / -1" }}><FormLabel>Description</FormLabel><Textarea value={maintenance.description || ""} {...readOnlyFieldProps} rows={3} /></FormControl>
              <FormControl gridColumn={{ base: "1 / -1", md: "1 / -1" }}><FormLabel>Resolution Note</FormLabel><Textarea value={maintenance.resolution_note || ""} {...readOnlyFieldProps} rows={3} /></FormControl>
            </SimpleGrid>
          )}
        </ModalBody>
        <ModalFooter gap={3}>
          {isCreateMode ? (
            <><Button variant="ghost" onClick={onClose}>Cancel</Button><Button colorScheme="blue" onClick={handleSubmit} isLoading={isSubmitting}>Save</Button></>
          ) : isEditing ? (
            <><Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button><Button colorScheme="blue" onClick={handleSubmit} isLoading={isSubmitting}>Save</Button></>
          ) : (
            <><Button colorScheme="red" variant="outline" onClick={() => onDelete?.(maintenance)} isLoading={isDeleting}>Delete</Button><Button colorScheme="blue" onClick={() => setIsEditing(true)}>Edit</Button></>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
