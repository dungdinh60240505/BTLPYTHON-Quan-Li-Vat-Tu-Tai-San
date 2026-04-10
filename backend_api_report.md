# Báo cáo Database Models và API Endpoints

## Tổng quan

Dự án quản lý tài sản PTIT sử dụng FastAPI, SQLAlchemy ORM và SQLite. API chính được mount dưới prefix `/api/v1`.

Backend hiện có các nhóm chức năng chính:
- Authentication
- Users
- Departments
- Assets
- Supplies
- Allocations
- Maintenances
- Reports

Ngoài các API nghiệp vụ, ứng dụng còn có:
- `GET /` để trả về thông tin chào mừng và đường dẫn docs
- `GET /health` để kiểm tra trạng thái ứng dụng
- `GET /api/v1/health` để kiểm tra trạng thái API kèm version
- `StaticFiles` mount tại `/uploads` để phục vụ file upload cục bộ

## Database Models

### 1. User
**Mô tả:** Người dùng hệ thống có thể đăng nhập và thao tác theo vai trò.

**Các trường chính:**
- `id` (int, PK)
- `username` (str, unique)
- `email` (str, unique)
- `full_name` (str)
- `hashed_password` (str)
- `phone_number` (str, nullable)
- `role` (enum: `admin`, `manager`, `staff`)
- `avatar_url` (str, nullable)
- `is_active` (bool)
- `department_id` (int, FK tới `departments`, nullable tùy dữ liệu)
- `created_at` (datetime)
- `updated_at` (datetime)

**Relationships:**
- Thuộc về `Department`

### 2. Department
**Mô tả:** Phòng ban hoặc đơn vị quản lý người dùng và tài sản.

**Các trường chính:**
- `id` (int, PK)
- `code` (str, unique)
- `name` (str, unique)
- `description` (text, nullable)
- `is_active` (bool)
- `created_at` (datetime)
- `updated_at` (datetime)

**Relationships:**
- Có nhiều `User`

### 3. Asset
**Mô tả:** Tài sản cố định như máy tính, máy chiếu, thiết bị.

**Các trường chính:**
- `id` (int, PK)
- `asset_code` (str, unique)
- `name` (str)
- `category` (str)
- `serial_number` (str, nullable, unique)
- `specification` (text, nullable)
- `purchase_date` (date, nullable)
- `purchase_cost` (decimal, nullable)
- `status` (enum: `available`, `in_use`, `under_maintenance`, `damaged`, `liquidated`)
- `condition` (enum: `new`, `good`, `fair`, `poor`, `broken`)
- `location` (str, nullable)
- `note` (text, nullable)
- `is_active` (bool)
- `assigned_department_id` (int, FK, nullable)
- `assigned_user_id` (int, FK, nullable)
- `created_at` (datetime)
- `updated_at` (datetime)

### 4. Supply
**Mô tả:** Vật tư tiêu hao như giấy, mực, phụ kiện.

**Các trường chính:**
- `id` (int, PK)
- `supply_code` (str, unique)
- `name` (str)
- `category` (str)
- `unit` (str, mặc định `"item"`)
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

### 5. Allocation
**Mô tả:** Ghi nhận cấp phát tài sản hoặc vật tư cho phòng ban hoặc người dùng.

**Các trường chính:**
- `id` (int, PK)
- `allocation_code` (str, unique)
- `allocation_type` (enum: `asset`, `supply`)
- `status` (enum: `active`, `completed`, `returned`, `cancelled`)
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

**Lưu ý:** Chức năng `allocation` không có xử lý file, không có cột attachment/file path và API không dùng `UploadFile`.

### 6. Maintenance
**Mô tả:** Ghi nhận bảo trì tài sản cố định.

**Các trường chính:**
- `id` (int, PK)
- `maintenance_code` (str, unique)
- `asset_id` (int, FK)
- `maintenance_type` (enum: `preventive`, `corrective`, `inspection`, `warranty`, `other`)
- `status` (enum: `scheduled`, `in_progress`, `completed`, `cancelled`)
- `priority` (enum: `low`, `medium`, `high`, `urgent`)
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

**Lưu ý:** Chức năng `maintenance` không có xử lý file, không có upload biên bản, hóa đơn hay tài liệu đính kèm.

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Đăng ký tài khoản mới
- `POST /api/v1/auth/login` - Đăng nhập bằng `OAuth2PasswordRequestForm`
- `POST /api/v1/auth/login-json` - Đăng nhập bằng JSON
- `GET /api/v1/auth/me` - Lấy thông tin người dùng hiện tại
- `POST /api/v1/auth/me/avatar` - Upload avatar cho người dùng hiện tại
- `POST /api/v1/auth/change-password` - Đổi mật khẩu

### Users
- `GET /api/v1/users` - Liệt kê users, có filter `keyword`, `department_id`, `role`, `is_active`
- `GET /api/v1/users/{user_id}` - Chi tiết user
- `POST /api/v1/users` - Tạo user mới
- `PUT /api/v1/users/{user_id}` - Cập nhật user
- `PATCH /api/v1/users/{user_id}/deactivate` - Vô hiệu hóa user
- `PATCH /api/v1/users/{user_id}/activate` - Kích hoạt lại user

### Departments
- `GET /api/v1/departments` - Liệt kê departments
- `GET /api/v1/departments/{department_id}` - Chi tiết department
- `POST /api/v1/departments` - Tạo department mới
- `PUT /api/v1/departments/{department_id}` - Cập nhật department
- `PATCH /api/v1/departments/{department_id}/deactivate` - Vô hiệu hóa department

### Assets
- `GET /api/v1/assets` - Liệt kê assets, có filter `keyword`, `category`, `status`, `condition`, `assigned_department_id`, `assigned_user_id`, `is_active`
- `GET /api/v1/assets/{asset_id}` - Chi tiết asset
- `POST /api/v1/assets` - Tạo asset mới
- `PUT /api/v1/assets/{asset_id}` - Cập nhật asset
- `PATCH /api/v1/assets/{asset_id}/status` - Cập nhật trạng thái asset
- `PATCH /api/v1/assets/{asset_id}/deactivate` - Vô hiệu hóa asset

### Supplies
- `GET /api/v1/supplies` - Liệt kê supplies, có filter `keyword`, `category`, `managed_department_id`, `low_stock_only`, `is_active`
- `GET /api/v1/supplies/{supply_id}` - Chi tiết supply
- `POST /api/v1/supplies` - Tạo supply mới
- `PUT /api/v1/supplies/{supply_id}` - Cập nhật supply
- `PATCH /api/v1/supplies/{supply_id}/stock` - Cập nhật tồn kho
- `PATCH /api/v1/supplies/{supply_id}/deactivate` - Vô hiệu hóa supply

### Allocations
- `GET /api/v1/allocations` - Liệt kê allocations, có filter `keyword`, `allocation_type`, `status`, `allocated_department_id`, `allocated_user_id`, `asset_id`, `supply_id`, `is_active`
- `GET /api/v1/allocations/{allocation_id}` - Chi tiết allocation
- `POST /api/v1/allocations` - Tạo allocation mới
- `PUT /api/v1/allocations/{allocation_id}` - Cập nhật allocation
- `PATCH /api/v1/allocations/{allocation_id}/status` - Cập nhật trạng thái allocation
- `PATCH /api/v1/allocations/{allocation_id}/deactivate` - Vô hiệu hóa allocation

### Maintenances
- `GET /api/v1/maintenances` - Liệt kê maintenances, có filter `keyword`, `asset_id`, `assigned_to_user_id`, `reported_by_user_id`, `maintenance_type`, `priority`, `status`, `is_active`
- `GET /api/v1/maintenances/{maintenance_id}` - Chi tiết maintenance
- `POST /api/v1/maintenances` - Tạo maintenance mới
- `PUT /api/v1/maintenances/{maintenance_id}` - Cập nhật maintenance
- `PATCH /api/v1/maintenances/{maintenance_id}/status` - Cập nhật trạng thái maintenance
- `PATCH /api/v1/maintenances/{maintenance_id}/deactivate` - Vô hiệu hóa maintenance

### Reports
- `GET /api/v1/reports/dashboard-summary` - Tổng quan dashboard
- `GET /api/v1/reports/asset-status-summary` - Thống kê trạng thái assets
- `GET /api/v1/reports/low-stock-supplies` - Danh sách supplies tồn kho thấp
- `GET /api/v1/reports/allocation-status-summary` - Thống kê trạng thái allocations
- `GET /api/v1/reports/maintenance-status-summary` - Thống kê trạng thái maintenances
- `GET /api/v1/reports/recent-activity` - Hoạt động gần đây, có query `limit`

## Authorization

### ADMIN
- Toàn quyền quản trị
- Tạo và cập nhật user
- Kích hoạt hoặc vô hiệu hóa user
- Vô hiệu hóa các bản ghi quan trọng như department, asset, supply, allocation, maintenance

### MANAGER
- Quản lý departments
- Quản lý assets, supplies, allocations, maintenances
- Xem reports
- Xem danh sách users

### STAFF
- Đăng nhập và xem thông tin cá nhân
- Cập nhật tồn kho supplies
- Tạo maintenance
- Cập nhật trạng thái maintenance
- Xem allocations và maintenances theo quyền router hiện tại

## Ghi chú về xử lý file

Backend hiện có xử lý file, nhưng chỉ áp dụng cho avatar người dùng:
- Thư mục upload gốc: `backend/uploads`
- Thư mục avatar: `backend/uploads/avatars`
- Endpoint upload: `POST /api/v1/auth/me/avatar`
- Kiểu nhận file: `UploadFile`
- Thư viện liên quan trong `requirements.txt`: `python-multipart`

Các chức năng `allocation` và `maintenance` hiện không xử lý file:
- Không có `UploadFile`, `File(...)` hay `Form(...)` trong router của hai chức năng này
- Không có field lưu attachment/file path trong model
- Frontend đang gửi dữ liệu JSON/CRUD thông thường cho hai module này

## Frontend / Integration Notes

1. Sử dụng JWT token cho authentication.
2. Có thể dùng `POST /api/v1/auth/login` nếu gửi form-data chuẩn OAuth2, hoặc `POST /api/v1/auth/login-json` nếu frontend gửi JSON.
3. Avatar người dùng cần gửi `multipart/form-data`.
4. Các module còn lại chủ yếu dùng JSON payload.
5. Reports hiện có nhiều endpoint hơn bản ghi chú cũ, bao gồm thống kê allocation, maintenance và recent activity.
