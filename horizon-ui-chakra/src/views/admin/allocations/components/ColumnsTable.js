/* eslint-disable */

import {
  Button,
  Flex,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import * as React from "react";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AddIcon, SearchIcon } from "@chakra-ui/icons";

import Card from "components/card/Card";
import AllocationModal from "./AllocationModal";

const columnHelper = createColumnHelper();
const PAGE_SIZE = 10;
const ALLOCATION_STATUS_OPTIONS = ["active", "returned", "cancelled"];
const PDF_MAROON = "#7a1f2b";

const stringToUint8Array = (value) => new TextEncoder().encode(value);

const dataUrlToUint8Array = (dataUrl) => {
  const base64 = dataUrl.split(",")[1];
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }
  return bytes;
};

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

const normalizeValue = (value) => {
  if (value == null || value === "") {
    return "";
  }
  else if(value=="returned"){
    return "Đã trả";
  }
  else if(value=="active"){
    return "Đang sử dụng";
  }
  else if(value=="cancelled"){
    return "Đã hủy";
  }
  return String(value);
};

const wrapText = (context, text, maxWidth) => {
  const words = normalizeValue(text).split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [""];
  }

  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });


const buildAllocationsPdfBlob = async (rows, logoSrc) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const canvasWidth = 1600;
  const rowHeight = 44;
  const totalRows = Math.max(rows.length, 12);
  canvas.width = canvasWidth;
  canvas.height = 520 + totalRows * rowHeight + 180;

  context.fillStyle = "#fffdf8";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const logoBox = { x: 60, y: 36, w: 170, h: 110 };
  if (logoSrc) {
    try {
      const logoImg = await loadImage(logoSrc);
      context.drawImage(logoImg, logoBox.x, logoBox.y, logoBox.w, logoBox.h);
    } catch (error) {
      context.strokeStyle = PDF_MAROON;
      context.lineWidth = 3;
      context.strokeRect(logoBox.x, logoBox.y, logoBox.w, logoBox.h);
      context.fillStyle = PDF_MAROON;
      context.font = "bold 22px Arial";
      context.textAlign = "center";
      context.fillText("LOGO", logoBox.x + logoBox.w / 2, logoBox.y + 46);
    }
  } else {
    context.strokeStyle = PDF_MAROON;
    context.lineWidth = 3;
    context.strokeRect(logoBox.x, logoBox.y, logoBox.w, logoBox.h);
    context.fillStyle = PDF_MAROON;
    context.font = "bold 22px Arial";
    context.textAlign = "center";
    context.fillText("LOGO", logoBox.x + logoBox.w / 2, logoBox.y + 46);
    context.font = "18px Arial";
    context.fillText("Đặt biểu tượng", logoBox.x + logoBox.w / 2, logoBox.y + 76);
    context.fillText("của trường tại đây", logoBox.x + logoBox.w / 2, logoBox.y + 100);
  }

  context.textAlign = "center";
  context.fillStyle = PDF_MAROON;
  context.font = "bold 40px 'Times New Roman'";
  context.fillText("PHIẾU ĐĂNG KÝ CẤP PHÁT THIẾT BỊ", canvasWidth / 2 + 60, 74);
  context.font = "22px 'Times New Roman'";

  context.textAlign = "left";
  context.fillStyle = "#1f2937";
  context.font = "bold 22px 'Times New Roman'";
  context.fillText("Đơn vị / Phòng ban: ...............................................................", 60, 190);
  context.fillText("Người lập phiếu: .................................................................", 60, 226);
  context.fillText("Ghi chú chung: ...................................................................", 60, 262);

  const tableLeft = 20;
  const tableTop = 310;
  const columnWidths = [50, 110, 110, 120, 100, 130, 300, 60, 150, 150, 120, 160];
  const headers = [
    "STT",
    "Ngày cấp",
    "Ngày trả",
    "Mã phiếu",
    "Loại",
    "Mã vật phẩm",
    "Tên vật phẩm",
    "SL",
    "Phòng ban",
    "Người nhận",
    "Trạng thái",
    "Ghi chú",
  ];
  const tableWidth = canvasWidth - 40;

  context.fillStyle = "#f6e8ea";
  context.fillRect(tableLeft, tableTop, tableWidth, rowHeight);

  context.strokeStyle = "#2d2d2d";
  context.lineWidth = 1.5;
  context.strokeRect(tableLeft, tableTop, tableWidth, rowHeight * (totalRows + 1));

  let headerX = tableLeft;
  context.font = "bold 19px 'Times New Roman'";
  context.fillStyle = PDF_MAROON;
  headers.forEach((header, index) => {
    const width = columnWidths[index];
    context.strokeRect(headerX, tableTop, width, rowHeight);
    const headerLines = wrapText(context, header, width - 12);
    headerLines.forEach((line, lineIndex) => {
      context.fillText(line, headerX + 8, tableTop + 18 + lineIndex * 16);
    });
    headerX += width;
  });

  context.font = "16px 'Times New Roman'";
  context.fillStyle = "#111827";
  const printableRows = [...rows];
  while (printableRows.length < totalRows) {
    printableRows.push(null);
  }

  printableRows.forEach((row, rowIndex) => {
    const y = tableTop + rowHeight * (rowIndex + 1);
    let cellX = tableLeft;
    const cellValues = row
      ? [
          String(rowIndex + 1),
          normalizeValue(row.allocated_at),
          normalizeValue(row.expected_return_date),
          normalizeValue(row.allocation_code),
          normalizeValue(row.allocation_type),
          normalizeValue(row.item_code),
          normalizeValue(row.item_name),
          normalizeValue(row.quantity),
          normalizeValue(row.department),
          normalizeValue(row.allocated_user),
          normalizeValue(row.status),
          "",
        ]
      : new Array(headers.length).fill("");

    cellValues.forEach((value, columnIndex) => {
      const width = columnWidths[columnIndex];
      context.strokeRect(cellX, y, width, rowHeight);
      const lines = wrapText(context, value, width - 10).slice(0, 2);
      lines.forEach((line, lineIndex) => {
        context.fillText(line, cellX + 6, y + 17 + lineIndex * 15);
      });
      cellX += width;
    });
  });

  const footerY = tableTop + rowHeight * (totalRows + 1) + 70;
  context.fillStyle = PDF_MAROON;
  context.font = "bold 22px 'Times New Roman'";
  context.textAlign = "center";
  context.fillText("Người lập phiếu", canvasWidth - 240, footerY);
  context.font = "20px 'Times New Roman'";
  context.fillText("(Ký và ghi rõ họ tên)", canvasWidth - 240, footerY + 34);

  const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
  return createPdfFromJpeg({
    imageBytes: dataUrlToUint8Array(jpegDataUrl),
    imageWidth: canvas.width,
    imageHeight: canvas.height,
  });
};

export default function ColumnTable(props) {
  const {
    tableData,
    title,
    onDeleteAllocation,
    onSaveAllocation,
    onCreateAllocation,
    assetOptions,
    supplyOptions,
    departmentOptions,
    userOptions,
    addLabel = "Add"
  } = props;
  const [sorting, setSorting] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [allocationTypeFilter, setAllocationTypeFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("");
  const [userFilter, setUserFilter] = React.useState("");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [selectedAllocation, setSelectedAllocation] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState("edit");
  const [isExporting, setIsExporting] = React.useState(false);
  const toast = useToast();
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const rowHoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const addButtonBg = useColorModeValue("blue.500", "blue.300");
  const addButtonHoverBg = useColorModeValue("blue.600", "blue.200");
  const addButtonColor = useColorModeValue("white", "gray.900");
  const searchIconColor = useColorModeValue("gray.400", "gray.300");
  const searchInputBg = useColorModeValue("secondaryGray.300", "navy.900");
  const searchInputColor = useColorModeValue("gray.700", "gray.100");
  const columns = [
    columnHelper.accessor("stt", {
      id: "stt",
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          STT
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("allocation_code", {
      id: "allocation_code",
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          CODE
        </Text>
      ),
      cell: (info) => (
        <Flex align="center">
          <Text color={textColor} fontSize="sm" fontWeight="700">
            {info.getValue()}
          </Text>
        </Flex>
      ),
    }),
    columnHelper.accessor("allocation_type", {
      id: "allocation_type",
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          TYPE
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700" textTransform="capitalize">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          STATUS
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700" textTransform="capitalize">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("item_name", {
      id: "item_name",
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          ITEM
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("quantity", {
      id: "quantity",
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          QUANTITY
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("department", {
      id: "department",
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          DEPARTMENT
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("allocated_user", {
      id: "allocated_user",
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          USER
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("allocated_at", {
      id: "allocated_at",
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          ALLOCATED AT
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
  ];

  const data = React.useMemo(() => tableData ?? [], [tableData]);
  const allocationTypeOptions = React.useMemo(() => {
    const values = Array.from(
      new Set(
        data
          .map((row) => row.allocation_type)
          .filter((value) => value != null && String(value).trim() !== ""),
      ),
    );

    return values.sort((a, b) => String(a).localeCompare(String(b)));
  }, [data]);
  const filteredData = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return data.filter((row) => {
      const matchesKeyword = !normalizedSearch
        || Object.values(row).some(
          (value) => value != null && String(value).toLowerCase().includes(normalizedSearch),
        );
      const matchesType = !allocationTypeFilter
        || String(row.allocation_type ?? "") === allocationTypeFilter;
      const matchesStatus = !statusFilter
        || String(row.status ?? "") === statusFilter;
      const matchesDepartment = !departmentFilter
        || String(row.allocated_department_id ?? "") === departmentFilter;
      const matchesUser = !userFilter
        || String(row.allocated_user_id ?? "") === userFilter;

      return matchesKeyword && matchesType && matchesStatus && matchesDepartment && matchesUser;
    });
  }, [allocationTypeFilter, data, departmentFilter, searchTerm, statusFilter, userFilter]);
  const isSubmitting = Boolean(selectedAllocation && selectedAllocation.id === onSaveAllocation?.loadingId);
  const isDeleting = Boolean(selectedAllocation && selectedAllocation.id === onDeleteAllocation?.loadingId);
  const isCreating = Boolean(onCreateAllocation?.loading);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });
  const rows = table.getRowModel().rows;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(pageIndex, totalPages - 1);
  const paginatedRows = rows.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );
  const startRow = rows.length === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const endRow = Math.min((currentPage + 1) * PAGE_SIZE, rows.length);

  React.useEffect(() => {
    setPageIndex(0);
  }, [allocationTypeFilter, departmentFilter, searchTerm, sorting, statusFilter, tableData, userFilter]);

  React.useEffect(() => {
    if (pageIndex !== currentPage) {
      setPageIndex(currentPage);
    }
  }, [currentPage, pageIndex]);

  const handleRowClick = (allocation) => {
    setSelectedAllocation(allocation);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting || isDeleting) {
      return;
    }
    setIsModalOpen(false);
    setSelectedAllocation(null);
  };

  const handleSave = async (allocation) => {
    await onSaveAllocation?.handler?.(allocation);
    handleCloseModal();
  };

  const handleDelete = async (allocation) => {
    await onDeleteAllocation?.handler?.(allocation);
    handleCloseModal();
  };

  const handleCreate = async (allocation) => {
    await onCreateAllocation?.handler?.(allocation);
    handleCloseModal();
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      const pdfBlob = await buildAllocationsPdfBlob(filteredData, "/logo-ptit.png");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
    } catch (error) {
      console.error("Export allocations PDF failed:", error);
      toast({
        title: "Export file failed",
        description: "Khong the tao PDF allocations",
        status: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Card flexDirection="column" w="100%" px="0px" overflowX={{ sm: "scroll", lg: "hidden" }}>
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" mb="4px" fontWeight="700" lineHeight="100%">
            {title ? title : "Default Title"}
          </Text>
        <Flex align="center" gap="12px">
            <Button
              variant="outline"
              colorScheme="red"
              borderColor={PDF_MAROON}
              color={PDF_MAROON}
              _hover={{ bg: "red.50" }}
              onClick={handleExportPdf}
              isLoading={isExporting}
            >
              Export File
            </Button>
            <Button
              leftIcon={<AddIcon boxSize={3} />}
              bg={addButtonBg}
              color={addButtonColor}
              _hover={{ bg: addButtonHoverBg, transform: "translateY(-1px)", boxShadow: "lg" }}
              _active={{ bg: addButtonHoverBg }}
              transition="all 0.2s ease"
              borderRadius="12px"
              fontWeight="700"
              onClick={() => {
                setSelectedAllocation(null);
                setModalMode("create");
                setIsModalOpen(true);
              }}
            >
              {addLabel}
            </Button>
          </Flex>
        </Flex>
        <Flex px="25px" mb="4px" gap="12px" flexDirection={{ base: "column", md: "row" }} wrap="wrap">
          <InputGroup maxW={{ base: "100%", md: "260px" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color={searchIconColor} />
            </InputLeftElement>
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search allocations..."
              bg={searchInputBg}
              color={searchInputColor}
              borderRadius="16px"
              _placeholder={{ color: "gray.400" }}
            />
          </InputGroup>
          <Select
            maxW={{ base: "100%", md: "180px" }}
            value={allocationTypeFilter}
            onChange={(event) => setAllocationTypeFilter(event.target.value)}
            bg={searchInputBg}
            color={searchInputColor}
            borderRadius="16px"
          >
            <option value="">All types</option>
            {allocationTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Select
            maxW={{ base: "100%", md: "180px" }}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            bg={searchInputBg}
            color={searchInputColor}
            borderRadius="16px"
          >
            <option value="">All status</option>
            {ALLOCATION_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Select
            maxW={{ base: "100%", md: "220px" }}
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            bg={searchInputBg}
            color={searchInputColor}
            borderRadius="16px"
          >
            <option value="">All departments</option>
            {(departmentOptions ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            maxW={{ base: "100%", md: "220px" }}
            value={userFilter}
            onChange={(event) => setUserFilter(event.target.value)}
            bg={searchInputBg}
            color={searchInputColor}
            borderRadius="16px"
          >
            <option value="">All allocated users</option>
            {(userOptions ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Flex>
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      colSpan={header.colSpan}
                      pe="10px"
                      borderColor={borderColor}
                      cursor="pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <Flex justifyContent="space-between" align="center" fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: "", desc: "" }[header.column.getIsSorted()] ?? null}
                      </Flex>
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {paginatedRows.length === 0 ? (
                <Tr>
                  <Td colSpan={columns.length} textAlign="center" py="24px" color="gray.400">
                    No allocations found.
                  </Td>
                </Tr>
              ) : (
                paginatedRows.map((row) => (
                  <Tr
                    key={row.id}
                    onClick={() => handleRowClick(row.original)}
                    data-item-id={row.original.id}
                    cursor="pointer"
                    _hover={{ bg: rowHoverBg }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Td
                        key={cell.id}
                        fontSize={{ sm: "14px" }}
                        minW={{ sm: "150px", md: "200px", lg: "auto" }}
                        borderColor="transparent"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Td>
                    ))}
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
        <Flex
          px="25px"
          pb="20px"
          mt="-8px"
          justifyContent="space-between"
          align={{ base: "flex-start", md: "center" }}
          flexDirection={{ base: "column", md: "row" }}
          gap="12px"
        >
          <Text color="gray.400" fontSize="sm">
            {rows.length === 0
              ? "No records available"
              : `Showing ${startRow}-${endRow} of ${rows.length} records`}
          </Text>
          <Flex align="center" gap="8px">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
              isDisabled={currentPage === 0}
            >
              Previous
            </Button>
            <Text color={textColor} fontSize="sm" fontWeight="600">
              Page {currentPage + 1} / {totalPages}
            </Text>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))}
              isDisabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      </Card>
      <AllocationModal
        mode={modalMode}
        allocation={selectedAllocation}
        assetOptions={assetOptions}
        supplyOptions={supplyOptions}
        departmentOptions={departmentOptions}
        userOptions={userOptions}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDelete={handleDelete}
        onSave={modalMode === "create" ? handleCreate : handleSave}
        isDeleting={isDeleting}
        isSubmitting={modalMode === "create" ? isCreating : isSubmitting}
      />
    </>
  );
}
