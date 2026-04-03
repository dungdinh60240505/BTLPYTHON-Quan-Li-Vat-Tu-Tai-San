# Báo cáo Database Models và API Endpoints

## Tổng quan
Dự án quản lý tài sản PTIT sử dụng FastAPI backend với SQLAlchemy ORM và SQLite database. Có 6 models chính: User, Department, Asset, Supply, Allocation, Maintenance.

## Database Models

### 1. User
**Mô tả:** Người dùng hệ thống có thể đăng nhập và quản lý tài sản/vật tư.

**Các trường:**
- `id` (int, PK)
- `username` (str, unique)
- `email` (str, unique)
- `full_name` (str)
- `hashed_password` (str)
- `phone_number` (str, nullable)
- `role` (enum: admin, manager, staff)
- `is_active` (bool)
- `department_id` (int, FK to departments)

**Relationships:**
- Thuộc về Department

### 2. Department
**Mô tả:** Phòng ban/khoa trong PTIT sở hữu người dùng và tài sản.

**Các trường:**
- `id` (int, PK)
- `code` (str, unique)
- `name` (str, unique)
- `description` (text, nullable)
- `is_active` (bool)
- `created_at` (datetime)
- `updated_at` (datetime)

**Relationships:**
- Có nhiều Users

### 3. Asset
**Mô tả:** Tài sản cố định như máy tính, máy chiếu, v.v.

**Các trường:**
- `id` (int, PK)
- `asset_code` (str, unique)
- `name` (str)
- `category` (str)
- `serial_number` (str, nullable, unique)
- `specification` (text, nullable)
- `purchase_date` (date, nullable)
- `purchase_cost` (decimal, nullable)
- `status` (enum: available, in_use, under_maintenance, damaged, liquidated)
- `condition` (enum: new, good, fair, poor, broken)
- `location` (str, nullable)
- `note` (text, nullable)
- `is_active` (bool)
- `assigned_department_id` (int, FK, nullable)
- `assigned_user_id` (int, FK, nullable)
- `created_at` (datetime)
- `updated_at` (datetime)

**Relationships:**
- Thuộc về Department và User

### 4. Supply
**Mô tả:** Vật tư tiêu hao như giấy, mực, dây cáp, v.v.

**Các trường:**
- `id` (int, PK)
- `supply_code` (str, unique)
- `name` (str)
- `category` (str)
- `unit` (str, default: "item")
- `quantity_in_stock` (decimal)
- `minimum_stock_level` (decimal)
- `unit_price` (decimal, nullable)
- `location` (str, nullable)
- `description` (text, nullable)
- `note` (text, nullable)
- `managed_department_id` (int, FK, nullable)
- `is_active` (bool)
- `created_at` (datetime)
- `updated_at` (datetime)

**Relationships:**
- Quản lý bởi Department

### 5. Allocation
**Mô tả:** Ghi nhận cấp phát tài sản hoặc vật tư cho phòng ban/người dùng.

**Các trường:**
- `id` (int, PK)
- `allocation_code` (str, unique)
- `allocation_type` (enum: asset, supply)
- `status` (enum: active, completed, returned, cancelled)
- `asset_id` (int, FK, nullable)
- `supply_id` (int, FK, nullable)
- `quantity` (decimal)
- `allocated_department_id` (int, FK, nullable)
- `allocated_user_id` (int, FK, nullable)
- `allocated_by_user_id` (int, FK, nullable)
- `allocated_at` (datetime)
- `expected_return_date` (date, nullable)
- `returned_at` (datetime, nullable)
- `purpose` (text, nullable)
- `note` (text, nullable)
- `is_active` (bool)
- `created_at` (datetime)
- `updated_at` (datetime)

### 6. Maintenance
**Mô tả:** Ghi nhận bảo trì tài sản cố định.

**Các trường:**
- `id` (int, PK)
- `maintenance_code` (str, unique)
- `asset_id` (int, FK)
- `maintenance_type` (enum: preventive, corrective, inspection, warranty, other)
- `status` (enum: scheduled, in_progress, completed, cancelled)
- `priority` (enum: low, medium, high, urgent)
- `title` (str)
- `description` (text, nullable)
- `scheduled_date` (date, nullable)
- `started_at` (datetime, nullable)
- `completed_at` (datetime, nullable)
- `next_maintenance_date` (date, nullable)
- `cost` (decimal, nullable)
- `vendor_name` (str, nullable)
- `resolution_note` (text, nullable)
- `reported_by_user_id` (int, FK, nullable)
- `assigned_to_user_id` (int, FK, nullable)
- `is_active` (bool)
- `created_at` (datetime)
- `updated_at` (datetime)

## API Endpoints

### Authentication
- `POST /auth/register` - Đăng ký user mới
- `POST /auth/login` - Đăng nhập, trả về JWT token

### Users
- `GET /users` - Liệt kê users (có filter: keyword, department_id, role, is_active)
- `GET /users/{user_id}` - Chi tiết user
- `POST /users` - Tạo user mới (ADMIN only)
- `PUT /users/{user_id}` - Cập nhật user (ADMIN only)
- `PATCH /users/{user_id}/activate` - Kích hoạt user (ADMIN only)
- `PATCH /users/{user_id}/deactivate` - Vô hiệu hóa user (ADMIN only)

### Departments
- `GET /departments` - Liệt kê departments
- `GET /departments/{department_id}` - Chi tiết department
- `POST /departments` - Tạo department mới (ADMIN/MANAGER)
- `PUT /departments/{department_id}` - Cập nhật department (ADMIN/MANAGER)
- `PATCH /departments/{department_id}/deactivate` - Vô hiệu hóa department (ADMIN)

### Assets
- `GET /assets` - Liệt kê assets (có filter: keyword, category, status, condition, assigned_department_id, assigned_user_id, is_active)
- `GET /assets/{asset_id}` - Chi tiết asset
- `POST /assets` - Tạo asset mới (ADMIN/MANAGER)
- `PUT /assets/{asset_id}` - Cập nhật asset (ADMIN/MANAGER)
- `PATCH /assets/{asset_id}/status` - Cập nhật trạng thái asset (ADMIN/MANAGER)
- `PATCH /assets/{asset_id}/deactivate` - Vô hiệu hóa asset (ADMIN)

### Supplies
- `GET /supplies` - Liệt kê supplies (có filter: keyword, category, managed_department_id, low_stock_only, is_active)
- `GET /supplies/{supply_id}` - Chi tiết supply
- `POST /supplies` - Tạo supply mới (ADMIN/MANAGER)
- `PUT /supplies/{supply_id}` - Cập nhật supply (ADMIN/MANAGER)
- `PATCH /supplies/{supply_id}/stock` - Cập nhật tồn kho (ADMIN/MANAGER/STAFF)
- `PATCH /supplies/{supply_id}/deactivate` - Vô hiệu hóa supply (ADMIN)

### Allocations
- `GET /allocations` - Liệt kê allocations (có filter: keyword, allocation_type, status, allocated_department_id, allocated_user_id, asset_id, supply_id, is_active)
- `GET /allocations/{allocation_id}` - Chi tiết allocation
- `POST /allocations` - Tạo allocation mới (ADMIN/MANAGER)
- `PUT /allocations/{allocation_id}` - Cập nhật allocation (ADMIN/MANAGER)
- `PATCH /allocations/{allocation_id}/status` - Cập nhật trạng thái allocation (ADMIN/MANAGER)
- `PATCH /allocations/{allocation_id}/deactivate` - Vô hiệu hóa allocation (ADMIN)

### Maintenances
- `GET /maintenances` - Liệt kê maintenances (có filter: keyword, asset_id, assigned_to_user_id, reported_by_user_id, maintenance_type, priority, status, is_active)
- `GET /maintenances/{maintenance_id}` - Chi tiết maintenance
- `POST /maintenances` - Tạo maintenance mới (ADMIN/MANAGER/STAFF)
- `PUT /maintenances/{maintenance_id}` - Cập nhật maintenance (ADMIN/MANAGER)
- `PATCH /maintenances/{maintenance_id}/status` - Cập nhật trạng thái maintenance (ADMIN/MANAGER/STAFF)
- `PATCH /maintenances/{maintenance_id}/deactivate` - Vô hiệu hóa maintenance (ADMIN)

### Reports
- `GET /reports/dashboard-summary` - Tổng quan dashboard
- `GET /reports/asset-status-summary` - Thống kê trạng thái assets
- `GET /reports/low-stock-supplies` - Danh sách supplies tồn kho thấp

## Authorization
- **ADMIN**: Toàn quyền
- **MANAGER**: Quản lý assets, supplies, allocations, maintenances; xem reports
- **STAFF**: Xem và cập nhật stock supplies, tạo maintenances

## Frontend Implementation Notes
1. Sử dụng JWT token cho authentication
2. Implement CRUD tables cho mỗi entity
3. Form validation theo schemas
4. Filter và pagination cho danh sách
5. Dashboard với charts từ reports API
6. Role-based UI components