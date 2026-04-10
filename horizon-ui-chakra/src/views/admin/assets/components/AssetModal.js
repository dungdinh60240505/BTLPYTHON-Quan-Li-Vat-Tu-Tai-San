import React from "react";
import {
  Button,
  SimpleGrid,
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
  Stack,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";

const initialFormData = {
  code: "",
  name: "",
  category: "",
  serial_number: "",
  specification: "",
  purchase_date: "",
  purchase_cost: "",
  status: "available",
  condition: "good",
  location: "",
  note: "",
  assigned_department_id: "",
  assigned_user_id: "",
};

export default function AssetModal(props) {
  const {
    asset,
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
  const readOnlyTextColor = useColorModeValue("secondaryGray.900", "white");
  const readOnlyBorderColor = useColorModeValue("secondaryGray.100", "whiteAlpha.100");
  const modalBg = useColorModeValue("white", "navy.800");
  const readOnlyBg = useColorModeValue("secondaryGray.300", "navy.700");
  const [formData, setFormData] = React.useState(initialFormData);

  React.useEffect(() => {
    if (!isOpen) return;
    if (isCreateMode) {
      setFormData(initialFormData);
      setIsEditing(true);
      return;
    }
    if (!asset) return;
    setFormData({
      code: asset.code || asset.asset_code || "",
      name: asset.name || "",
      category: asset.category || "",
      serial_number: asset.serial_number || "",
      specification: asset.specification || "",
      purchase_date: asset.purchase_date || "",
      purchase_cost: asset.purchase_cost || "",
      status: asset.status || "available",
      condition: asset.condition || "good",
      location: asset.location || "",
      note: asset.note || "",
      assigned_department_id: asset.assigned_department_id ?? "",
      assigned_user_id: asset.assigned_user_id ?? "",
    });
    setIsEditing(false);
  }, [asset, isCreateMode, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await onSave?.({
      ...(isCreateMode ? {} : { id: asset.id }),
      ...formData,
      code: formData.code.trim(),
      name: formData.name.trim(),
      category: formData.category.trim(),
      serial_number: formData.serial_number.trim(),
      specification: formData.specification.trim(),
      location: formData.location.trim(),
      note: formData.note.trim(),
      assigned_department_id: formData.assigned_department_id === "" ? null : Number(formData.assigned_department_id),
      assigned_user_id: formData.assigned_user_id === "" ? null : Number(formData.assigned_user_id),
    });
    if (!isCreateMode) setIsEditing(false);
  };

  if (!isCreateMode && !asset) return null;

  const readOnlyFieldProps = {
    isReadOnly: true,
    variant: "main",
    color: readOnlyTextColor,
    borderColor: readOnlyBorderColor,
    bg: readOnlyBg,
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg={modalBg}>
        <ModalHeader>{isCreateMode ? "Add Asset" : "Asset Detail"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isCreateMode || isEditing ? (
            <Stack spacing={4}>
              <FormControl isRequired><FormLabel>Code</FormLabel><Input value={formData.code} onChange={(e) => handleChange("code", e.target.value)} /></FormControl>
              <FormControl isRequired><FormLabel>Name</FormLabel><Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} /></FormControl>
              <FormControl isRequired><FormLabel>Category</FormLabel><Input value={formData.category} onChange={(e) => handleChange("category", e.target.value)} /></FormControl>
              <FormControl><FormLabel>Serial Number</FormLabel><Input value={formData.serial_number} onChange={(e) => handleChange("serial_number", e.target.value)} /></FormControl>
              <FormControl><FormLabel>Specification</FormLabel><Textarea value={formData.specification} onChange={(e) => handleChange("specification", e.target.value)} rows={3} /></FormControl>
              <FormControl><FormLabel>Purchase Date</FormLabel><Input type="date" value={formData.purchase_date} onChange={(e) => handleChange("purchase_date", e.target.value)} /></FormControl>
              <FormControl><FormLabel>Purchase Cost</FormLabel><Input type="number" value={formData.purchase_cost} onChange={(e) => handleChange("purchase_cost", e.target.value)} /></FormControl>
              <FormControl><FormLabel>Status</FormLabel><Select value={formData.status} onChange={(e) => handleChange("status", e.target.value)}><option value="available">available</option><option value="in_use">in_use</option><option value="under_maintenance">under_maintenance</option><option value="damaged">damaged</option><option value="liquidated">liquidated</option></Select></FormControl>
              <FormControl><FormLabel>Condition</FormLabel><Select value={formData.condition} onChange={(e) => handleChange("condition", e.target.value)}><option value="new">new</option><option value="good">good</option><option value="fair">fair</option><option value="poor">poor</option><option value="broken">broken</option></Select></FormControl>
              <FormControl><FormLabel>Location</FormLabel><Input value={formData.location} onChange={(e) => handleChange("location", e.target.value)} /></FormControl>
              <FormControl><FormLabel>Note</FormLabel><Textarea value={formData.note} onChange={(e) => handleChange("note", e.target.value)} rows={3} /></FormControl>
              <FormControl>
                <FormLabel>Assigned Department ID</FormLabel>
                <Select
                  placeholder="Select department"
                  value={formData.assigned_department_id}
                  onChange={(e) => handleChange("assigned_department_id", e.target.value)}
                >
                  {departmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Assigned User ID</FormLabel>
                <Select
                  placeholder="Select user"
                  value={formData.assigned_user_id}
                  onChange={(e) => handleChange("assigned_user_id", e.target.value)}
                >
                  {userOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl><FormLabel>ID</FormLabel><Input value={asset.id || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Code</FormLabel><Input value={asset.asset_code || asset.code || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Name</FormLabel><Input value={asset.name || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Category</FormLabel><Input value={asset.category || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Serial Number</FormLabel><Input value={asset.serial_number || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl gridColumn={{ base: "1 / -1", md: "1 / -1" }}><FormLabel>Specification</FormLabel><Textarea value={asset.specification || ""} {...readOnlyFieldProps} rows={2} /></FormControl>
              <FormControl><FormLabel>Purchase Date</FormLabel><Input value={asset.purchase_date || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Purchase Cost</FormLabel><Input value={asset.purchase_cost || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Status</FormLabel><Input value={asset.status || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Condition</FormLabel><Input value={asset.condition || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Location</FormLabel><Input value={asset.location || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl gridColumn={{ base: "1 / -1", md: "1 / -1" }}><FormLabel>Note</FormLabel><Textarea value={asset.note || ""} {...readOnlyFieldProps} rows={2} /></FormControl>
              <FormControl><FormLabel>Assigned Department</FormLabel><Input value={asset.assigned_department?.name || asset.assigned_department || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Assigned User</FormLabel><Input value={asset.assigned_user?.name || asset.assigned_user?.full_name || asset.assigned_user || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Created at</FormLabel><Input value={asset.created_at || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Updated at</FormLabel><Input value={asset.updated_at || ""} {...readOnlyFieldProps} /></FormControl>
            </SimpleGrid>
          )}
        </ModalBody>
        <ModalFooter gap={3}>
          {isCreateMode ? (
            <><Button variant="ghost" onClick={onClose}>Cancel</Button><Button colorScheme="blue" onClick={handleSubmit} isLoading={isSubmitting}>Save</Button></>
          ) : isEditing ? (
            <><Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button><Button colorScheme="blue" onClick={handleSubmit} isLoading={isSubmitting}>Save</Button></>
          ) : (
            <><Button colorScheme="red" variant="outline" onClick={() => onDelete?.(asset)} isLoading={isDeleting}>Delete</Button><Button colorScheme="blue" onClick={() => setIsEditing(true)}>Edit</Button></>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
