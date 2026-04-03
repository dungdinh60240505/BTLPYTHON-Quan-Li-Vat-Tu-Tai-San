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
} from '@chakra-ui/react';
import * as React from 'react';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { AddIcon, SearchIcon } from '@chakra-ui/icons';
import { MdCheck, MdFilterList } from 'react-icons/md';

import Card from 'components/card/Card';
import SupplyModal from './SupplyModal';

const columnHelper = createColumnHelper();
const PAGE_SIZE = 10;

export default function ColumnTable(props) {
  const { tableData, title, onDeleteSupply, onSaveSupply, onCreateSupply, departmentOptions, addLabel = 'Add' } = props;
  const [sorting, setSorting] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [departmentFilter, setDepartmentFilter] = React.useState('');
  const [pageIndex, setPageIndex] = React.useState(0);
  const [filters, setFilters] = React.useState({
    active: true,
    inactive: true,
  });
  const [selectedSupply, setSelectedSupply] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState('edit');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const rowHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const addButtonBg = useColorModeValue('blue.500', 'blue.300');
  const addButtonHoverBg = useColorModeValue('blue.600', 'blue.200');
  const addButtonColor = useColorModeValue('white', 'gray.900');
  const searchIconColor = useColorModeValue('gray.400', 'gray.300');
  const searchInputBg = useColorModeValue('secondaryGray.300', 'navy.900');
  const searchInputColor = useColorModeValue('gray.700', 'gray.100');
  const filterButtonBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const filterButtonHoverBg = useColorModeValue('secondaryGray.400', 'whiteAlpha.200');
  const filterMenuBg = useColorModeValue('white', 'navy.800');
  const filterMenuShadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    'unset',
  );
  const columns = [
    columnHelper.accessor('stt', {
      id: 'stt',
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          STT
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('supply_code', {
      id: 'supply_code',
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
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
    columnHelper.accessor('name', {
      id: 'name',
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          NAME
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('category', {
      id: 'category',
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          CATEGORY
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('unit', {
      id: 'unit',
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          UNIT
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('quantity_in_stock', {
      id: 'quantity_in_stock',
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          QUANTITY IN STOCK
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('location', {
      id: 'location',
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          LOCATION
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('managed_department', {
      id: 'managed_department',
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          DEPARTMENT
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('is_active', {
      id: 'is_active',
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          IS_ACTIVE
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
      allowedStatuses.push('active');
    }
    if (filters.inactive) {
      allowedStatuses.push('inactive');
    }

    return data.filter((row) => {
      const matchesKeyword = !normalizedSearch
        || Object.values(row).some(
          (value) => value != null && String(value).toLowerCase().includes(normalizedSearch),
        );
      const matchesDepartment = !departmentFilter
        || String(row.managed_department_id ?? '') === departmentFilter;
      const matchesActive = allowedStatuses.length === 0
        ? true
        : allowedStatuses.includes(String(row.is_active ?? '').toLowerCase());

      return matchesKeyword && matchesDepartment && matchesActive;
    });
  }, [data, departmentFilter, filters, searchTerm]);
  const isSubmitting = Boolean(selectedSupply && selectedSupply.id === onSaveSupply?.loadingId);
  const isDeleting = Boolean(selectedSupply && selectedSupply.id === onDeleteSupply?.loadingId);
  const isCreating = Boolean(onCreateSupply?.loading);

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
  }, [departmentFilter, filters, searchTerm, sorting, tableData]);

  React.useEffect(() => {
    if (pageIndex !== currentPage) {
      setPageIndex(currentPage);
    }
  }, [currentPage, pageIndex]);

  const handleRowClick = (supply) => {
    setSelectedSupply(supply);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting || isDeleting) {
      return;
    }
    setIsModalOpen(false);
    setSelectedSupply(null);
  };

  const handleSave = async (supply) => {
    await onSaveSupply?.handler?.(supply);
    handleCloseModal();
  };

  const handleDelete = async (supply) => {
    await onDeleteSupply?.handler?.(supply);
    handleCloseModal();
  };

  const handleCreate = async (supply) => {
    await onCreateSupply?.handler?.(supply);
    handleCloseModal();
  };

  return (
    <>
      <Card flexDirection="column" w="100%" px="0px" overflowX={{ sm: 'scroll', lg: 'hidden' }}>
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text color={textColor} fontSize="22px" mb="4px" fontWeight="700" lineHeight="100%">
            {title ? title : 'Default Title'}
          </Text>
        <Flex align="center" gap="12px">
            <Button
              leftIcon={<AddIcon boxSize={3} />}
              bg={addButtonBg}
              color={addButtonColor}
              _hover={{ bg: addButtonHoverBg, transform: 'translateY(-1px)', boxShadow: 'lg' }}
              _active={{ bg: addButtonHoverBg }}
              transition="all 0.2s ease"
              borderRadius="12px"
              fontWeight="700"
              onClick={() => {
                setSelectedSupply(null);
                setModalMode('create');
                setIsModalOpen(true);
              }}
            >
              {addLabel}
            </Button>
            <Menu>
              <MenuButton
                as={Button}
                leftIcon={<Icon as={MdFilterList} boxSize={4} />}
                bg={filterButtonBg}
                _hover={{ bg: filterButtonHoverBg }}
                _active={{ bg: filterButtonHoverBg }}
                borderRadius="12px"
                fontWeight="700"
              >
                Filter
              </MenuButton>
              <MenuList
                minW="180px"
                border="transparent"
                bg={filterMenuBg}
                boxShadow={filterMenuShadow}
                borderRadius="16px"
                p="10px"
              >
                <MenuItem borderRadius="10px" onClick={() => toggleFilter('active')}>
                  <Flex w="100%" align="center" justifyContent="space-between">
                    <Text>Active</Text>
                    {filters.active && <Icon as={MdCheck} boxSize={4} />}
                  </Flex>
                </MenuItem>
                <MenuItem borderRadius="10px" onClick={() => toggleFilter('inactive')}>
                  <Flex w="100%" align="center" justifyContent="space-between">
                    <Text>Inactive</Text>
                    {filters.inactive && <Icon as={MdCheck} boxSize={4} />}
                  </Flex>
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
        <Flex px="25px" mb="4px" gap="12px" flexDirection={{ base: 'column', md: 'row' }} wrap="wrap">
          <InputGroup maxW={{ base: '100%', md: '320px' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color={searchIconColor} />
            </InputLeftElement>
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search supplies..."
              bg={searchInputBg}
              color={searchInputColor}
              borderRadius="16px"
              _placeholder={{ color: 'gray.400' }}
            />
          </InputGroup>
          <Select
            maxW={{ base: '100%', md: '240px' }}
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            bg={searchInputBg}
            color={searchInputColor}
            borderRadius="16px"
          >
            <option value="">All managed departments</option>
            {(departmentOptions ?? []).map((option) => (
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
                      <Flex justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: '', desc: '' }[header.column.getIsSorted()] ?? null}
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
                    No supplies found.
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
                        fontSize={{ sm: '14px' }}
                        minW={{ sm: '150px', md: '200px', lg: 'auto' }}
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
          align={{ base: 'flex-start', md: 'center' }}
          flexDirection={{ base: 'column', md: 'row' }}
          gap="12px"
        >
          <Text color="gray.400" fontSize="sm">
            {rows.length === 0
              ? 'No records available'
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
      <SupplyModal
        mode={modalMode}
        supply={selectedSupply}
        departmentOptions={departmentOptions}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDelete={handleDelete}
        onSave={modalMode === 'create' ? handleCreate : handleSave}
        isDeleting={isDeleting}
        isSubmitting={modalMode === 'create' ? isCreating : isSubmitting}
      />
    </>
  );
}
