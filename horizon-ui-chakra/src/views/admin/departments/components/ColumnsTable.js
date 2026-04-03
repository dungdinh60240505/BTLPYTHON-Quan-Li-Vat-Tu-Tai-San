/* eslint-disable */

import {
  Button,
  Flex,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
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

// Custom components
import Card from 'components/card/Card';
import Menu from 'components/menu/MainMenu';
import DepartmentModal from './DepartmentModal';

const columnHelper = createColumnHelper();
const PAGE_SIZE = 10;

// const columns = columnsDataCheck;
export default function ColumnTable(props) {
  const { tableData, title, onDeleteDepartment, onSaveDepartment, onCreateDepartment, addLabel = 'Add' } = props;
  const [sorting, setSorting] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [pageIndex, setPageIndex] = React.useState(0);
  const [selectedDepartment, setSelectedDepartment] = React.useState(null);
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
  const columns = [
    columnHelper.accessor('stt', {
      id: 'stt',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          STT
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
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          NAME
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
    columnHelper.accessor('description', {
      id: 'description',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          DESCRIPTION
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
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          IS_ACTIVE
        </Text>
      ),
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor('created_at', {
      id: 'created_at',
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: '10px', lg: '12px' }}
          color="gray.400"
        >
          CREATED_AT
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

    if (!normalizedSearch) {
      return data;
    }

    return data.filter((row) =>
      Object.values(row).some(
        (value) => value != null && String(value).toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [data, searchTerm]);
  const isSubmitting = Boolean(
    selectedDepartment && selectedDepartment.id === onSaveDepartment?.loadingId,
  );
  const isDeleting = Boolean(
    selectedDepartment && selectedDepartment.id === onDeleteDepartment?.loadingId,
  );
  const isCreating = Boolean(onCreateDepartment?.loading);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
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
  }, [searchTerm, sorting, tableData]);

  React.useEffect(() => {
    if (pageIndex !== currentPage) {
      setPageIndex(currentPage);
    }
  }, [currentPage, pageIndex]);

  const handleRowClick = (department) => {
    setSelectedDepartment(department);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting || isDeleting) {
      return;
    }

    setIsModalOpen(false);
    setSelectedDepartment(null);
  };

  const handleSave = async (department) => {
    await onSaveDepartment?.handler?.(department);
    handleCloseModal();
  };

  const handleDelete = async (department) => {
    await onDeleteDepartment?.handler?.(department);
    handleCloseModal();
  };

  const handleCreate = async (department) => {
    await onCreateDepartment?.handler?.(department);
    handleCloseModal();
  };

  return (
    <>
      <Card
        flexDirection="column"
        w="100%"
        px="0px"
        overflowX={{ sm: 'scroll', lg: 'hidden' }}
      >
        <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
          <Text
            color={textColor}
            fontSize="22px"
            mb="4px"
            fontWeight="700"
            lineHeight="100%"
          >
            { title ? title : "Default Title"}
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
                setSelectedDepartment(null);
                setModalMode('create');
                setIsModalOpen(true);
              }}
            >
              {addLabel}
            </Button>
            <Menu />
          </Flex>
        </Flex>
        <Box px="25px" mb="4px">
          <InputGroup maxW={{ base: '100%', md: '320px' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color={searchIconColor} />
            </InputLeftElement>
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search departments..."
              bg={searchInputBg}
              color={searchInputColor}
              borderRadius="16px"
              _placeholder={{ color: 'gray.400' }}
            />
          </InputGroup>
        </Box>
        <Box>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <Th
                        key={header.id}
                        colSpan={header.colSpan}
                        pe="10px"
                        borderColor={borderColor}
                        cursor="pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <Flex
                          justifyContent="space-between"
                          align="center"
                          fontSize={{ sm: '10px', lg: '12px' }}
                          color="gray.400"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: '',
                            desc: '',
                          }[header.column.getIsSorted()] ?? null}
                        </Flex>
                      </Th>
                    );
                  })}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {paginatedRows.length === 0 ? (
                <Tr>
                  <Td colSpan={columns.length} textAlign="center" py="24px" color="gray.400">
                    No departments found.
                  </Td>
                </Tr>
              ) : (
                paginatedRows.map((row) => {
                  return (
                    <Tr
                      key={row.id}
                      onClick={() => handleRowClick(row.original)}
                      data-item-id={row.original.id}
                      cursor="pointer"
                      _hover={{ bg: rowHoverBg }}
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <Td
                            key={cell.id}
                            fontSize={{ sm: '14px' }}
                            minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                            borderColor="transparent"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </Td>
                        );
                      })}
                    </Tr>
                  );
                })
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

      <DepartmentModal
        mode={modalMode}
        department={selectedDepartment}
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
