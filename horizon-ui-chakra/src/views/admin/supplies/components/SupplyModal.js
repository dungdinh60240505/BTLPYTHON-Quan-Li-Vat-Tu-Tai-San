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
  supply_code: "",
  name: "",
  category: "",
  unit: "",
  quantity_in_stock: "",
  minimum_stock_level: "",
  unit_price: "",
  location: "",
  description: "",
  note: "",
  managed_department_id: "",
  is_active: true,
};

export default function SupplyModal(props) {
  const {
    supply,
    departmentOptions = [],
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
    if (!supply) return;
    setFormData({
      supply_code: supply.supply_code || "",
      name: supply.name || "",
      category: supply.category || "",
      unit: supply.unit || "",
      quantity_in_stock: supply.quantity_in_stock ?? "",
      minimum_stock_level: supply.minimum_stock_level ?? "",
      unit_price: supply.unit_price ?? "",
      location: supply.location || "",
      description: supply.description || "",
      note: supply.note || "",
      managed_department_id: supply.managed_department_id ?? "",
      is_active: Boolean(supply.is_active_raw ?? supply.is_active === "Active"),
    });
    setIsEditing(false);
  }, [supply, isCreateMode, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await onSave?.({
      ...(isCreateMode ? {} : { id: supply.id }),
      supply_code: formData.supply_code.trim(),
      name: formData.name.trim(),
      category: formData.category.trim(),
      unit: formData.unit.trim(),
      quantity_in_stock: formData.quantity_in_stock === "" ? null : Number(formData.quantity_in_stock),
      minimum_stock_level: formData.minimum_stock_level === "" ? null : Number(formData.minimum_stock_level),
      unit_price: formData.unit_price === "" ? null : Number(formData.unit_price),
      location: formData.location.trim(),
      description: formData.description.trim(),
      note: formData.note.trim(),
      managed_department_id: formData.managed_department_id === "" ? null : Number(formData.managed_department_id),
      is_active: formData.is_active,
    });
    if (!isCreateMode) setIsEditing(false);
  };

  if (!isCreateMode && !supply) return null;

  const isSupplyActive =
    typeof supply?.is_active_raw === "boolean"
      ? supply.is_active_raw
      : typeof supply?.is_active === "string"
        ? supply.is_active === "Active"
        : Boolean(supply?.is_active);

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
        <ModalHeader>{isCreateMode ? "Add Supply" : "Supply Detail"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!isCreateMode && !isEditing && (
            <Badge colorScheme={isSupplyActive ? "green" : "red"} px="12px" py="6px" mb={4} borderRadius="full" textTransform="none" fontSize="sm">
              {isSupplyActive ? "Active" : "Inactive"}
            </Badge>
          )}
          {isCreateMode || isEditing ? (
            <Stack spacing={4}>
              <FormControl isRequired><FormLabel>Code</FormLabel><Input value={formData.supply_code} onChange={(e) => handleChange("supply_code", e.target.value)} /></FormControl>
              <FormControl isRequired><FormLabel>Name</FormLabel><Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} /></FormControl>
              <FormControl isRequired><FormLabel>Category</FormLabel><Input value={formData.category} onChange={(e) => handleChange("category", e.target.value)} /></FormControl>
              <FormControl isRequired><FormLabel>Unit</FormLabel><Input value={formData.unit} onChange={(e) => handleChange("unit", e.target.value)} /></FormControl>
              <FormControl><FormLabel>Quantity in stock</FormLabel><Input type="number" value={formData.quantity_in_stock} onChange={(e) => handleChange("quantity_in_stock", e.target.value)} /></FormControl>
              <FormControl><FormLabel>Minimum stock level</FormLabel><Input type="number" value={formData.minimum_stock_level} onChange={(e) => handleChange("minimum_stock_level", e.target.value)} /></FormControl>
              <FormControl><FormLabel>Unit price</FormLabel><Input type="number" value={formData.unit_price} onChange={(e) => handleChange("unit_price", e.target.value)} /></FormControl>
              <FormControl><FormLabel>Location</FormLabel><Input value={formData.location} onChange={(e) => handleChange("location", e.target.value)} /></FormControl>
              <FormControl><FormLabel>Description</FormLabel><Textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} /></FormControl>
              <FormControl><FormLabel>Note</FormLabel><Textarea value={formData.note} onChange={(e) => handleChange("note", e.target.value)} rows={3} /></FormControl>
              {isCreateMode ? (
                <FormControl>
                  <FormLabel>Managed Department ID</FormLabel>
                  <Select placeholder="Select department" value={formData.managed_department_id} onChange={(e) => handleChange("managed_department_id", e.target.value)}>
                    {departmentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <FormControl><FormLabel>Managed Department ID</FormLabel><Input type="number" value={formData.managed_department_id} onChange={(e) => handleChange("managed_department_id", e.target.value)} /></FormControl>
              )}
              <FormControl display="flex" alignItems="center" gap={3}><FormLabel mb="0">Active</FormLabel><Switch isChecked={formData.is_active} onChange={(e) => handleChange("is_active", e.target.checked)} /></FormControl>
            </Stack>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl><FormLabel>ID</FormLabel><Input value={supply.id || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Code</FormLabel><Input value={supply.supply_code || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Name</FormLabel><Input value={supply.name || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Category</FormLabel><Input value={supply.category || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Unit</FormLabel><Input value={supply.unit || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Quantity in stock</FormLabel><Input value={supply.quantity_in_stock ?? ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Minimum stock level</FormLabel><Input value={supply.minimum_stock_level ?? ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Unit price</FormLabel><Input value={supply.unit_price ?? ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Location</FormLabel><Input value={supply.location || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Department</FormLabel><Input value={supply.managed_department || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Managed Department ID</FormLabel><Input value={supply.managed_department_id ?? ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl gridColumn={{ base: "1 / -1", md: "1 / -1" }}><FormLabel>Description</FormLabel><Textarea value={supply.description || ""} {...readOnlyFieldProps} rows={3} /></FormControl>
              <FormControl gridColumn={{ base: "1 / -1", md: "1 / -1" }}><FormLabel>Note</FormLabel><Textarea value={supply.note || ""} {...readOnlyFieldProps} rows={3} /></FormControl>
              <FormControl><FormLabel>Created at</FormLabel><Input value={supply.created_at || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Updated at</FormLabel><Input value={supply.updated_at || ""} {...readOnlyFieldProps} /></FormControl>
            </SimpleGrid>
          )}
        </ModalBody>
        <ModalFooter gap={3}>
          {isCreateMode ? (
            <><Button variant="ghost" onClick={onClose}>Cancel</Button><Button colorScheme="blue" onClick={handleSubmit} isLoading={isSubmitting}>Save</Button></>
          ) : isEditing ? (
            <><Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button><Button colorScheme="blue" onClick={handleSubmit} isLoading={isSubmitting}>Save</Button></>
          ) : (
            <><Button colorScheme="red" variant="outline" onClick={() => onDelete?.(supply)} isLoading={isDeleting}>Delete</Button><Button colorScheme="blue" onClick={() => setIsEditing(true)}>Edit</Button></>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
