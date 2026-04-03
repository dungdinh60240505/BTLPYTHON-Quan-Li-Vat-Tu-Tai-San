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
  SimpleGrid,
  Stack,
  Switch,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";

const initialFormData = {
  code: "",
  name: "",
  description: "",
  is_active: true,
};

export default function DepartmentModal(props) {
  const {
    department,
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
    if (!department) return;
    setFormData({
      code: department.code || "",
      name: department.name || "",
      description: department.description || "",
      is_active: Boolean(department.is_active_raw ?? department.is_active === "Active"),
    });
    setIsEditing(false);
  }, [department, isCreateMode, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await onSave?.({
      ...(isCreateMode ? {} : { id: department.id }),
      code: formData.code.trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      is_active: formData.is_active,
    });
    if (!isCreateMode) setIsEditing(false);
  };

  if (!isCreateMode && !department) return null;

  const isDepartmentActive =
    typeof department?.is_active_raw === "boolean"
      ? department.is_active_raw
      : typeof department?.is_active === "string"
        ? department.is_active === "Active"
        : Boolean(department?.is_active);

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
        <ModalHeader>{isCreateMode ? "Add Department" : "Department Detail"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!isCreateMode && !isEditing && (
            <Badge colorScheme={isDepartmentActive ? "green" : "red"} px="12px" py="6px" mb={4} borderRadius="full" textTransform="none" fontSize="sm">
              {isDepartmentActive ? "Active" : "Inactive"}
            </Badge>
          )}
          {isCreateMode || isEditing ? (
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Code</FormLabel>
                <Input value={formData.code} onChange={(e) => handleChange("code", e.target.value)} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} rows={4} />
              </FormControl>
              <FormControl display="flex" alignItems="center" gap={3}>
                <FormLabel mb="0">Active</FormLabel>
                <Switch isChecked={formData.is_active} onChange={(e) => handleChange("is_active", e.target.checked)} />
              </FormControl>
            </Stack>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl><FormLabel>ID</FormLabel><Input value={department.id || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Code</FormLabel><Input value={department.code || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Name</FormLabel><Input value={department.name || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl gridColumn={{ base: "1 / -1", md: "1 / -1" }}><FormLabel>Description</FormLabel><Textarea value={department.description || ""} {...readOnlyFieldProps} rows={3} /></FormControl>
              <FormControl><FormLabel>Created at</FormLabel><Input value={department.created_at || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Updated at</FormLabel><Input value={department.updated_at || ""} {...readOnlyFieldProps} /></FormControl>
            </SimpleGrid>
          )}
        </ModalBody>
        <ModalFooter gap={3}>
          {isCreateMode ? (
            <>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button colorScheme="blue" onClick={handleSubmit} isLoading={isSubmitting}>Save</Button>
            </>
          ) : isEditing ? (
            <>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button colorScheme="blue" onClick={handleSubmit} isLoading={isSubmitting}>Save</Button>
            </>
          ) : (
            <>
              <Button colorScheme="red" variant="outline" onClick={() => onDelete?.(department)} isLoading={isDeleting}>Delete</Button>
              <Button colorScheme="blue" onClick={() => setIsEditing(true)}>Edit</Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
