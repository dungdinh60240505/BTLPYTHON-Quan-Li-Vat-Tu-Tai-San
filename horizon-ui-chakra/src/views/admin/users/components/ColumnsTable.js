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
import UserModal from './UserModal';

const columnHelper = createColumnHelper();
const PAGE_SIZE = 10;

export default function ColumnTable(props) {
  const { tableData, title, onDeleteUser, onSaveUser, onCreateUser, departmentOptions, addLabel = 'Add' } = props;
  const [sorting, setSorting] = React.useState([]);
  const [keyword, setKeyword] = React.useState('');
  const [departmentSearch, setDepartmentSearch] = React.useState('');
  const [pageIndex, setPageIndex] = React.useState(0);
  const [filters, setFilters] = React.useState({
    admin: true,
    staff: true,
  });
  const [selectedUser, setSelectedUser] = React.useState(null);
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
    columnHelper.accessor('full_name', {
      id: 'full_name',
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          FULL NAME
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
    columnHelper.accessor('role', {
      id: 'role',
      header: () => (
        <Text justifyContent="space-between" align="center" fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">
          ROLE
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('department', {
      id: 'department',
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
  ];

  const data = React.useMemo(() => tableData ?? [], [tableData]);
  const filteredData = React.useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const normalizedDepartment = departmentSearch.trim().toLowerCase();
    const allowedRoles = [];

    if (filters.admin) {
      allowedRoles.push('admin');
    }
    if (filters.staff) {
      allowedRoles.push('staff');
    }

    return data.filter((row) => {
      const matchesDepartment = !normalizedDepartment
        || String(row.department_id ?? '').toLowerCase().includes(normalizedDepartment);
      const matchesKeyword = !normalizedKeyword
        || [
          row.username,
          row.email,
          row.full_name,
          row.phone_number,
          row.department,
          row.role,
        ].some(
          (value) => value != null && String(value).toLowerCase().includes(normalizedKeyword),
        );
      const matchesRole = allowedRoles.length === 0
        ? true
        : allowedRoles.includes(String(row.role ?? '').toLowerCase());

      return matchesDepartment && matchesKeyword && matchesRole;
    });
  }, [data, departmentSearch, filters, keyword]);
  const isSubmitting = Boolean(selectedUser && selectedUser.id === onSaveUser?.loadingId);
  const isDeleting = Boolean(selectedUser && selectedUser.id === onDeleteUser?.loadingId);
  const isCreating = Boolean(onCreateUser?.loading);

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
  }, [departmentSearch, filters, keyword, sorting, tableData]);

  React.useEffect(() => {
    if (pageIndex !== currentPage) {
      setPageIndex(currentPage);
    }
  }, [currentPage, pageIndex]);

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting || isDeleting) {
      return;
    }
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSave = async (user) => {
    await onSaveUser?.handler?.(user);
    handleCloseModal();
  };

  const handleDelete = async (user) => {
    await onDeleteUser?.handler?.(user);
    handleCloseModal();
  };

  const handleCreate = async (user) => {
    await onCreateUser?.handler?.(user);
    handleCloseModal();
  };

  const toggleFilter = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
                setSelectedUser(null);
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
                
                <MenuItem borderRadius="10px" onClick={() => toggleFilter('admin')}>
                  <Flex w="100%" align="center" justifyContent="space-between">
                    <Text>Admin</Text>
                    {filters.admin && <Icon as={MdCheck} boxSize={4} />}
                  </Flex>
                </MenuItem>
                <MenuItem borderRadius="10px" onClick={() => toggleFilter('staff')}>
                  <Flex w="100%" align="center" justifyContent="space-between">
                    <Text>Staff</Text>
                    {filters.staff && <Icon as={MdCheck} boxSize={4} />}
                  </Flex>
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
        <Flex px="25px" mb="4px" gap="12px" flexDirection={{ base: 'column', md: 'row' }}>
          <Select
            maxW={{ base: '100%', md: '220px' }}
            value={departmentSearch}
            onChange={(event) => setDepartmentSearch(event.target.value)}
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
          <InputGroup maxW={{ base: '100%', md: '320px' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color={searchIconColor} />
            </InputLeftElement>
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search keyword..."
              bg={searchInputBg}
              color={searchInputColor}
              borderRadius="16px"
              _placeholder={{ color: 'gray.400' }}
            />
          </InputGroup>
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
                    No users found.
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
      <UserModal
        mode={modalMode}
        user={selectedUser}
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
