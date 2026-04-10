/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2023 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// Chakra imports
import {
  Box,
  Icon,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import MiniCalendar from "components/calendar/MiniCalendar";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import React from "react";
import { MdBarChart } from "react-icons/md";
import ComplexTable from "views/admin/default/components/ComplexTable";
import Tasks from "views/admin/default/components/Tasks";
import {
  columnsDataComplex,
  columnsDataActiveUsers,
} from "views/admin/default/variables/columnsData";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

export default function UserReports() {
  // Chakra Color Mode
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const [summary, setSummary] = React.useState({
    total_departments: 0,
    total_users: 0,
    total_assets: 0,
    total_supplies: 0,
    active_allocations: 0,
    active_maintenances: 0,
    low_stock_supplies: 0,
  });
  const [lowStockSupplies, setLowStockSupplies] = React.useState([]);
  const [assetStatusSummary, setAssetStatusSummary] = React.useState([]);
  const [activeUsers, setActiveUsers] = React.useState([]);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const [summaryRes, lowStockRes, assetStatusRes, activeUsersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/reports/dashboard-summary`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/reports/low-stock-supplies`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/reports/asset-status-summary`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/users`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!summaryRes.ok) {
          throw new Error("Cannot load dashboard summary");
        }

        const data = await summaryRes.json();
        setSummary({
          total_departments: data.total_departments ?? 0,
          total_users: data.total_users ?? 0,
          total_assets: data.total_assets ?? 0,
          total_supplies: data.total_supplies ?? 0,
          active_allocations: data.active_allocations ?? 0,
          active_maintenances: data.active_maintenances ?? 0,
          low_stock_supplies: data.low_stock_supplies ?? 0,
        });

        if (lowStockRes.ok) {
          const lowStockData = await lowStockRes.json();
          setLowStockSupplies(lowStockData);
        }

        if (assetStatusRes.ok) {
          const assetStatusData = await assetStatusRes.json();
          setAssetStatusSummary(assetStatusData);
        }

        if (activeUsersRes.ok) {
          const activeUsersData = await activeUsersRes.json();
          setActiveUsers(
            activeUsersData.map((user) => ({
              ...user,
              department_name: user.department?.name ?? "No department",
            })),
          );
        }
        console.log("Users: ", activeUsers);
      } catch (error) {
        console.error("Fetch dashboard summary failed:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, "2xl": 6 }}
        gap='20px'
        mb='20px'>
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdBarChart} color={brandColor} />
              }
            />
          }
          name='Departments'
          value={String(summary.total_departments)}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdBarChart} color={brandColor} />
              }
            />
          }
          name='Users'
          value={String(summary.total_users)}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdBarChart} color={brandColor} />
              }
            />
          }
          name='Assets'
          value={String(summary.total_assets)}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdBarChart} color={brandColor} />
              }
            />
          }
          name='Supplies'
          value={String(summary.total_supplies)}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdBarChart} color={brandColor} />
              }
            />
          }
          name='Active Allocations'
          value={String(summary.active_allocations)}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdBarChart} color={brandColor} />
              }
            />
          }
          name='Active Maintenances'
          value={String(summary.active_maintenances)}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdBarChart} color={brandColor} />
              }
            />
          }
          name='Supplies Low Stock'
          value={String(summary.low_stock_supplies)}
        />
         {/* <MiniStatistics growth='+23%' name='Sales' value='$574.34' />
        <MiniStatistics
          endContent={
            <Flex me='-16px' mt='10px'>
              <FormLabel htmlFor='balance'>
                <Avatar src={Usa} />
              </FormLabel>
              <Select
                id='balance'
                variant='mini'
                mt='5px'
                me='0px'
                defaultValue='usd'>
                <option value='usd'>USD</option>
                <option value='eur'>EUR</option>
                <option value='gba'>GBA</option>
              </Select>
            </Flex>
          }
          name='Your balance'
          value='$1,000'
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
              icon={<Icon w='28px' h='28px' as={MdAddTask} color='white' />}
            />
          }
          name='New Tasks'
          value='154'
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdFileCopy} color={brandColor} />
              }
            />
          }
          name='Total Projects'
          value='2935'
        />*/}
      </SimpleGrid> 

      {/* <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>
        <TotalSpent />
        <WeeklyRevenue />
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap='20px' mb='20px'>
        <CheckTable columnsData={columnsDataCheck} tableData={tableDataCheck} />
        <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px'>
          <DailyTraffic />
          <PieCard />
        </SimpleGrid>
      </SimpleGrid> */}

      <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap='20px' mb='20px'>
        <ComplexTable
          columnsData={columnsDataComplex}
          tableData={lowStockSupplies}
          title="Low Stock Supplies"
        />
        <ComplexTable
          columnsData={columnsDataActiveUsers}
          tableData={activeUsers}
          title="Active Users"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap='20px' mb='20px'>
        <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px'>
          <Tasks title="Assets Status" tableData={assetStatusSummary} />
          <MiniCalendar h='100%' minW='100%' selectRange={false} />
        </SimpleGrid>
      </SimpleGrid>

    </Box>
  );
}
