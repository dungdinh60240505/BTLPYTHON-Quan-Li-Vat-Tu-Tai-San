/* eslint-disable */

import {
  Button,
  Flex,
  Box,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
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
import { MdCheck, MdFilterList } from "react-icons/md";

import Card from "components/card/Card";
import MaintenanceModal from "./MaintenanceModal";

const columnHelper = createColumnHelper();
const PAGE_SIZE = 10;
const MAINTENANCE_TYPE_OPTIONS = ["preventive", "corrective", "inspection", "warranty", "other"];
const MAINTENANCE_PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"];
const MAINTENANCE_STATUS_OPTIONS = ["scheduled", "in_progress", "completed", "cancelled"];
const PRIORITY_ORDER = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

export default function ColumnsTable(props) {
  const {
    tableData,
    title,
    onDeleteMaintenance,
    onSaveMaintenance,
    onCreateMaintenance,
    assetOptions,
    userOptions,
    addLabel = "Add",
  } = props;
  const [sorting, setSorting] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [prioritySort, setPrioritySort] = React.useState("");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [filters, setFilters] = React.useState({
    active: true,
    inactive: true,
  });
  const [selectedMaintenance, setSelectedMaintenance] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState("edit");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const rowHoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const addButtonBg = useColorModeValue("blue.500", "blue.300");
  const addButtonHoverBg = useColorModeValue("blue.600", "blue.200");
  const addButtonColor = useColorModeValue("white", "gray.900");
  const searchIconColor = useColorModeValue("gray.400", "gray.300");
  const searchInputBg = useColorModeValue("secondaryGray.300", "navy.900");
  const searchInputColor = useColorModeValue("gray.700", "gray.100");
  const filterButtonBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const filterButtonHoverBg = useColorModeValue("secondaryGray.400", "whiteAlpha.200");
  const filterMenuBg = useColorModeValue("white", "navy.800");
  const filterMenuShadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.18)",
    "unset",
  );

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
    columnHelper.accessor("maintenance_code", {
      id: "maintenance_code",
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          CODE
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("asset_name", {
      id: "asset_name",
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          ASSET
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("maintenance_type", {
      id: "maintenance_type",
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
    columnHelper.accessor("priority", {
      id: "priority",
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          PRIORITY
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700" textTransform="capitalize">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("title", {
      id: "title",
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          TITLE
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("created_at", {
      id: "created_at",
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          CREATED AT
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
  const filteredData = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const allowedStatuses = [];

    if (filters.active) {
      allowedStatuses.push("active");
    }
    if (filters.inactive) {
      allowedStatuses.push("inactive");
    }

    const result = data.filter((row) => {
      const matchesKeyword = !normalizedSearch
        || Object.values(row).some(
          (value) => value != null && String(value).toLowerCase().includes(normalizedSearch),
        );
      const matchesType = !typeFilter || String(row.maintenance_type ?? "") === typeFilter;
      const matchesPriority = !priorityFilter || String(row.priority ?? "") === priorityFilter;
      const matchesStatus = !statusFilter || String(row.status ?? "") === statusFilter;
      const normalizedRowStatus = String(row.status ?? "").toLowerCase();
      const matchesActive = allowedStatuses.length === 0
        ? true
        : allowedStatuses.includes(
            normalizedRowStatus === "completed" ? "inactive" : "active",
          );

      return matchesKeyword && matchesType && matchesPriority && matchesStatus && matchesActive;
    });

    if (!prioritySort) {
      return result;
    }

    return [...result].sort((a, b) => {
      const left = PRIORITY_ORDER[String(a.priority ?? "").toLowerCase()] ?? 0;
      const right = PRIORITY_ORDER[String(b.priority ?? "").toLowerCase()] ?? 0;

      if (prioritySort === "asc") {
        return left - right;
      }

      return right - left;
    });
  }, [data, filters, priorityFilter, prioritySort, searchTerm, statusFilter, typeFilter]);
  const isSubmitting = Boolean(selectedMaintenance && selectedMaintenance.id === onSaveMaintenance?.loadingId);
  const isDeleting = Boolean(selectedMaintenance && selectedMaintenance.id === onDeleteMaintenance?.loadingId);
  const isCreating = Boolean(onCreateMaintenance?.loading);

  const toggleFilter = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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
  }, [filters, priorityFilter, prioritySort, searchTerm, sorting, statusFilter, tableData, typeFilter]);

  React.useEffect(() => {
    if (pageIndex !== currentPage) {
      setPageIndex(currentPage);
    }
  }, [currentPage, pageIndex]);

  React.useEffect(() => {
    if (modalMode === "edit" && selectedMaintenance) {
      setIsModalOpen(true);
    }
  }, [modalMode, selectedMaintenance]);

  const handleRowClick = (maintenance) => {
    setIsModalOpen(false);
    setModalMode("edit");
    setSelectedMaintenance(maintenance);
  };

  const handleCloseModal = () => {
    if (isSubmitting || isDeleting) {
      return;
    }
    setIsModalOpen(false);
    setSelectedMaintenance(null);
  };

  const handleSave = async (maintenance) => {
    await onSaveMaintenance?.handler?.(maintenance);
    handleCloseModal();
  };

  const handleDelete = async (maintenance) => {
    await onDeleteMaintenance?.handler?.(maintenance);
    handleCloseModal();
  };

  const handleCreate = async (maintenance) => {
    await onCreateMaintenance?.handler?.(maintenance);
    handleCloseModal();
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
              leftIcon={<AddIcon boxSize={3} />}
              bg={addButtonBg}
              color={addButtonColor}
              _hover={{ bg: addButtonHoverBg, transform: "translateY(-1px)", boxShadow: "lg" }}
              _active={{ bg: addButtonHoverBg }}
              transition="all 0.2s ease"
              borderRadius="12px"
              fontWeight="700"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedMaintenance(null);
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
              placeholder="Search maintenances..."
              bg={searchInputBg}
              color={searchInputColor}
              borderRadius="16px"
              _placeholder={{ color: "gray.400" }}
            />
          </InputGroup>
          <Select
            maxW={{ base: "100%", md: "190px" }}
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            bg={searchInputBg}
            color={searchInputColor}
            borderRadius="16px"
          >
            <option value="">All types</option>
            {MAINTENANCE_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Select
            maxW={{ base: "100%", md: "190px" }}
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            bg={searchInputBg}
            color={searchInputColor}
            borderRadius="16px"
          >
            <option value="">All priorities</option>
            {MAINTENANCE_PRIORITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Select
            maxW={{ base: "100%", md: "200px" }}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            bg={searchInputBg}
            color={searchInputColor}
            borderRadius="16px"
          >
            <option value="">All status</option>
            {MAINTENANCE_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Select
            maxW={{ base: "100%", md: "220px" }}
            value={prioritySort}
            onChange={(event) => setPrioritySort(event.target.value)}
            bg={searchInputBg}
            color={searchInputColor}
            borderRadius="16px"
          >
            <option value="">Sort priority</option>
            <option value="asc">Priority asc</option>
            <option value="desc">Priority desc</option>
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
                    No maintenances found.
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
      <MaintenanceModal
        mode={modalMode}
        maintenance={selectedMaintenance}
        assetOptions={assetOptions}
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
