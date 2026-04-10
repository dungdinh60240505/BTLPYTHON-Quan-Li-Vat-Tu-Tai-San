import React from "react";
import {
  Badge,
  Button,
  FormControl,
  FormHelperText,
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
  Textarea,
  useToast,
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
  status: "active",
};

const toDateInputValue = (value) => {
  if (!value || value === "-") return "";
  return String(value).slice(0, 10);
};

const getStatusOptions = (allocationType) => {
  return [
    { value: "active", label: "Active" },
    { value: "returned", label: "Returned" },
    { value: "cancelled", label: "Cancelled" },
  ];
};

const formatDisplayValue = (value) => {
  if (value == null || value === "") {
    return "-";
  }
  return String(value);
};

const dataUrlToUint8Array = (dataUrl) => {
  const base64 = dataUrl.split(",")[1];
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }
  return bytes;
};

const stringToUint8Array = (value) => new TextEncoder().encode(value);

const mergePdfChunks = (chunks) => {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    merged.set(chunk, offset);
    offset += chunk.length;
  });
  return merged;
};

const createPdfFromJpeg = ({ imageBytes, imageWidth, imageHeight }) => {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const scale = Math.min(pageWidth / imageWidth, pageHeight / imageHeight);
  const renderWidth = imageWidth * scale;
  const renderHeight = imageHeight * scale;
  const offsetX = (pageWidth - renderWidth) / 2;
  const offsetY = pageHeight - renderHeight;

  const contentStream = `q\n${renderWidth} 0 0 ${renderHeight} ${offsetX} ${offsetY} cm\n/Im0 Do\nQ`;
  const pdfChunks = [];
  const offsets = [0];

  const pushChunk = (chunk) => {
    pdfChunks.push(chunk);
  };

  const pushText = (text) => {
    pushChunk(stringToUint8Array(text));
  };

  pushText("%PDF-1.4\n");

  const addObject = (objectNumber, beforeStream, streamBytes) => {
    offsets[objectNumber] = pdfChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    pushText(`${objectNumber} 0 obj\n`);
    pushText(beforeStream);
    if (streamBytes) {
      pushText("stream\n");
      pushChunk(streamBytes);
      pushText("\nendstream\n");
    }
    pushText("endobj\n");
  };

  addObject(1, "<< /Type /Catalog /Pages 2 0 R >>\n");
  addObject(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n");
  addObject(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\n`,
  );
  addObject(
    4,
    `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\n`,
    imageBytes,
  );
  addObject(
    5,
    `<< /Length ${stringToUint8Array(contentStream).length} >>\n`,
    stringToUint8Array(contentStream),
  );

  const xrefOffset = pdfChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  pushText("xref\n");
  pushText("0 6\n");
  pushText("0000000000 65535 f \n");
  for (let objectNumber = 1; objectNumber <= 5; objectNumber += 1) {
    pushText(`${String(offsets[objectNumber]).padStart(10, "0")} 00000 n \n`);
  }
  pushText("trailer\n");
  pushText("<< /Size 6 /Root 1 0 R >>\n");
  pushText("startxref\n");
  pushText(`${xrefOffset}\n`);
  pushText("%%EOF");

  return new Blob([mergePdfChunks(pdfChunks)], { type: "application/pdf" });
};

const wrapCanvasText = (context, text, maxWidth) => {
  const normalizedText = formatDisplayValue(text);
  const words = normalizedText.split(/\s+/);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : ["-"];
};

const buildAllocationPdfBlob = async (allocation) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const canvasWidth = 1240;
  const horizontalPadding = 80;
  const contentWidth = canvasWidth - horizontalPadding * 2;
  const titleFont = "bold 40px Arial";
  const sectionFont = "bold 24px Arial";
  const textFont = "20px Arial";
  const lineHeight = 34;

  const fields = [
    ["Allocation Code", allocation.allocation_code],
    ["Allocation Type", allocation.allocation_type],
    ["Status", allocation.status],
    ["Item Code", allocation.item_code],
    ["Item Name", allocation.item_name],
    ["Quantity", allocation.quantity],
    ["Department", allocation.department],
    ["Allocated Department ID", allocation.allocated_department_id],
    ["Allocated User", allocation.allocated_user],
    ["Allocated User ID", allocation.allocated_user_id],
    ["Allocated By", allocation.allocated_by_user],
    ["Allocated By User ID", allocation.allocated_by_user_id],
    ["Allocated At", allocation.allocated_at],
    ["Expected Return Date", allocation.expected_return_date],
    ["Returned At", allocation.returned_at],
    ["Created At", allocation.created_at],
    ["Updated At", allocation.updated_at],
  ];

  context.font = textFont;
  let estimatedHeight = 180;
  fields.forEach(([label, value]) => {
    estimatedHeight += wrapCanvasText(context, `${label}: ${formatDisplayValue(value)}`, contentWidth).length * lineHeight;
  });
  estimatedHeight += wrapCanvasText(context, `Purpose: ${formatDisplayValue(allocation.purpose)}`, contentWidth).length * lineHeight;
  estimatedHeight += wrapCanvasText(context, `Note: ${formatDisplayValue(allocation.note)}`, contentWidth).length * lineHeight;
  estimatedHeight += 80;

  canvas.width = canvasWidth;
  canvas.height = Math.max(estimatedHeight, 1400);

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  let cursorY = 80;
  context.fillStyle = "#0f172a";
  context.font = titleFont;
  context.fillText("Allocation Detail", horizontalPadding, cursorY);
  cursorY += 40;

  context.font = sectionFont;
  context.fillStyle = "#1d4ed8";
  context.fillText(`Code: ${formatDisplayValue(allocation.allocation_code)}`, horizontalPadding, cursorY + 20);
  cursorY += 70;

  context.font = textFont;
  context.fillStyle = "#111827";

  const drawWrappedText = (text) => {
    const lines = wrapCanvasText(context, text, contentWidth);
    lines.forEach((line) => {
      context.fillText(line, horizontalPadding, cursorY);
      cursorY += lineHeight;
    });
    cursorY += 8;
  };

  fields.forEach(([label, value]) => {
    drawWrappedText(`${label}: ${formatDisplayValue(value)}`);
  });

  cursorY += 8;
  context.font = sectionFont;
  context.fillStyle = "#1d4ed8";
  context.fillText("Description", horizontalPadding, cursorY);
  cursorY += 40;

  context.font = textFont;
  context.fillStyle = "#111827";
  drawWrappedText(`Purpose: ${formatDisplayValue(allocation.purpose)}`);
  drawWrappedText(`Note: ${formatDisplayValue(allocation.note)}`);

  const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
  const imageBytes = dataUrlToUint8Array(jpegDataUrl);
  return createPdfFromJpeg({
    imageBytes,
    imageWidth: canvas.width,
    imageHeight: canvas.height,
  });
};

export default function AllocationModal(props) {
  const {
    allocation,
    assetOptions = [],
    supplyOptions = [],
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
  const [isExporting, setIsExporting] = React.useState(false);
  const toast = useToast();
  const selectedSupplyOption =
    formData.allocation_type === "supply"
      ? supplyOptions.find((option) => option.value === String(formData.supply_id))
      : null;
  const selectedSupplyStock = selectedSupplyOption?.quantity_in_stock ?? 0;

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
    if (isCreateMode && formData.allocation_type === "supply") {
      const requestedQuantity = Number(formData.quantity || 0);
      if (!formData.supply_id) {
        toast({
          title: "Create allocation failed",
          description: "Please select a supply",
          status: "error",
        });
        return;
      }
      if (!Number.isFinite(requestedQuantity) || requestedQuantity < 1) {
        toast({
          title: "Create allocation failed",
          description: "Quantity must be at least 1",
          status: "error",
        });
        return;
      }
      if (requestedQuantity > selectedSupplyStock) {
        toast({
          title: "Create allocation failed",
          description: `Requested quantity exceeds stock. Available: ${selectedSupplyStock}`,
          status: "error",
        });
        return;
      }
    }

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
            }
          : {
              id: allocation.id,
              allocation_type: allocation.allocation_type,
              allocated_department_id: formData.allocated_department_id === "" ? null : Number(formData.allocated_department_id),
              allocated_user_id: formData.allocated_user_id === "" ? null : Number(formData.allocated_user_id),
              expected_return_date: formData.expected_return_date || null,
              purpose: formData.purpose.trim(),
              note: formData.note.trim(),
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

  const readOnlyFieldProps = {
    isReadOnly: true,
    variant: "main",
    color: readOnlyTextColor,
    borderColor: readOnlyBorderColor,
    bg: readOnlyBg,
  };
  const statusOptions = getStatusOptions(formData.allocation_type);

  const handleExportPdf = async () => {
    if (!allocation) {
      return;
    }

    try {
      setIsExporting(true);
      const pdfBlob = await buildAllocationPdfBlob(allocation);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
    } catch (error) {
      console.error("Export allocation PDF failed:", error);
      toast({
        title: "Export file failed",
        description: "Cannot generate allocation PDF",
        status: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

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
                      <FormControl isRequired>
                        <FormLabel>Supply ID</FormLabel>
                        <Select placeholder="Select supply" value={formData.supply_id} onChange={(e) => handleChange("supply_id", e.target.value)}>
                          {supplyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                        <FormHelperText>
                          {formData.supply_id
                            ? `Available in stock: ${selectedSupplyStock}`
                            : "Choose a supply to see current stock"}
                        </FormHelperText>
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Quantity</FormLabel>
                        <Input
                          type="number"
                          min="1"
                          max={formData.supply_id ? String(selectedSupplyStock) : undefined}
                          value={formData.quantity}
                          onChange={(e) => handleChange("quantity", e.target.value)}
                        />
                        {formData.supply_id && (
                          <FormHelperText color={Number(formData.quantity || 0) > selectedSupplyStock ? "red.500" : "secondaryGray.600"}>
                            {Number(formData.quantity || 0) > selectedSupplyStock
                              ? `Quantity cannot exceed ${selectedSupplyStock}`
                              : `Maximum allowed: ${selectedSupplyStock}`}
                          </FormHelperText>
                        )}
                      </FormControl>
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
            <>
              <Button variant="outline" colorScheme="green" onClick={handleExportPdf} isLoading={isExporting}>
                Export File
              </Button>
              <Button colorScheme="red" variant="outline" onClick={() => onDelete?.(allocation)} isLoading={isDeleting}>Delete</Button>
              <Button colorScheme="blue" onClick={() => setIsEditing(true)}>Edit</Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
