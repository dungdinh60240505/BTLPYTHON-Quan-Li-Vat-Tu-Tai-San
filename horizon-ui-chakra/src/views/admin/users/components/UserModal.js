import React from "react";
import {
  Tag,
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
  Switch,
  SimpleGrid,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";

const initialFormData = {
  username: "",
  email: "",
  is_active: true,
  full_name: "",
  phone_number: "",
  role: "staff",
  department_id: "",
  password: "",
  confirm_password: "",
};

export default function UserModal(props) {
  const {
    user,
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
    if (!user) return;
    setFormData({
      username: user.username || "",
      email: user.email || "",
      full_name: user.full_name || "",
      phone_number: user.phone_number || "",
      role: user.role || "staff",
      is_active: user.is_active ?? true,
      department_id: user.department_id ?? "",
      password: "",
      confirm_password: "",
    });
    setIsEditing(false);
  }, [user, isCreateMode, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await onSave?.({
      ...(isCreateMode ? {} : { id: user.id }),
      username: formData.username.trim(),
      email: formData.email.trim(),
      full_name: formData.full_name.trim(),
      phone_number: formData.phone_number.trim(),
      role: formData.role,
      is_active: formData.is_active,
      department_id: formData.department_id === "" ? null : Number(formData.department_id),
      ...(isCreateMode
        ? {
            password: formData.password,
            confirm_password: formData.confirm_password,
          }
        : {}),
    });
    if (!isCreateMode) setIsEditing(false);
  };

  if (!isCreateMode && !user) return null;

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
        <ModalHeader>{isCreateMode ? "Add User" : "User Detail"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isCreateMode || isEditing ? (
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input value={formData.username} onChange={(e) => handleChange("username", e.target.value)} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Full name</FormLabel>
                <Input value={formData.full_name} onChange={(e) => handleChange("full_name", e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Phone number</FormLabel>
                <Input value={formData.phone_number} onChange={(e) => handleChange("phone_number", e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select value={formData.role} onChange={(e) => handleChange("role", e.target.value)}>
                  <option value="admin">admin</option>
                  <option value="manager">manager</option>
                  <option value="staff">staff</option>
                </Select>
              </FormControl>
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb="0">Active</FormLabel>
                <Switch
                  isChecked={!!formData.is_active}
                  onChange={(e) => handleChange("is_active", e.target.checked)}
                />
            </FormControl>
              {isCreateMode ? (
                <FormControl>
                  <FormLabel>Department ID</FormLabel>
                  <Select placeholder="Select department" value={formData.department_id} onChange={(e) => handleChange("department_id", e.target.value)}>
                    {departmentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <FormControl>
                  <FormLabel>Department ID</FormLabel>
                  <Input type="number" value={formData.department_id} onChange={(e) => handleChange("department_id", e.target.value)} />
                </FormControl>
              )}
              {isCreateMode && (
                <>
                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input type="password" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input type="password" value={formData.confirm_password} onChange={(e) => handleChange("confirm_password", e.target.value)} />
                  </FormControl>
                </>
              )}
            </Stack>
          ) : (
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl><FormLabel>ID</FormLabel><Input value={user.id || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Username</FormLabel><Input value={user.username || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Email</FormLabel><Input value={user.email || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Full name</FormLabel><Input value={user.full_name || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Phone number</FormLabel><Input value={user.phone_number || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Role</FormLabel><Input value={user.role || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Department</FormLabel><Input value={user.department || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Department ID</FormLabel><Input value={user.department_id ?? ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Created at</FormLabel><Input value={user.created_at || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl><FormLabel>Updated at</FormLabel><Input value={user.updated_at || ""} {...readOnlyFieldProps} /></FormControl>
              <FormControl>
                <Tag colorScheme={user.is_active ? "green" : "red"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Tag>
              </FormControl>
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
              <Button colorScheme="red" variant="outline" onClick={() => onDelete?.(user)} isLoading={isDeleting}>Delete</Button>
              <Button colorScheme="blue" onClick={() => setIsEditing(true)}>Edit</Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
