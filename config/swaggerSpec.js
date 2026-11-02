export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'School Incident Dispatch API',
    version: '1.0.0',
    description: `### 🏫 Hệ Thống Điều Phối & Xử Lý Sự Cố Học Đường (Real-time Event Dispatching)
Xây dựng bằng **Node.js (Express 5)**, **MongoDB (Mongoose)**, **Socket.io**, **Pino Logger** và **Docker**.

---

### 🔑 Tài Khoản Mẫu Kiểm Thử (Mật khẩu chung cho tất cả: \`123\`)

| Tài khoản | Vai trò (Role) | Phòng ban (Department) | Quyền hạn kiểm thử |
| :--- | :--- | :--- | :--- |
| **\`admin01\`** | \`admin\` | Ban Giám Hiệu | Xem toàn bộ sự cố toàn trường, xem thống kê KPI Analytics |
| **\`tech01\`** | \`dispatcher\` | \`TECHNICAL\` | Xem sự cố điện/nước chờ xử lý, nhận việc (Atomic Lock), nghiệm thu |
| **\`tech02\`** | \`dispatcher\` | \`MEDICAL\` | Xem sự cố y tế/cấp cứu chờ xử lý, nhận việc |
| **\`student01\`** | \`student\` | Học sinh | Báo cáo sự cố mới, xem lịch sử các sự cố của chính mình |

---

### 🚀 Hướng Dẫn Test Nhanh Trong 3 Bước (Dưới 30 Giây):
1. **Bước 1:** Mở mục **Authentication** $\\rightarrow$ chọn **\`POST /api/users/login\`** $\\rightarrow$ bấm **Try it out** $\\rightarrow$ bấm **Execute** (đã điền sẵn tài khoản \`admin01\` / \`123\`).
2. **Bước 2:** Sao chép chuỗi mã \`token\` ở khung kết quả JSON phía dưới.
3. **Bước 3:** Cuộn lên đầu trang, bấm nút **Authorize 🔓** (màu xanh lá) $\\rightarrow$ dán token vào ô giá trị $\\rightarrow$ bấm **Authorize** $\\rightarrow$ **Close**.
*Xong! Giờ bạn có thể bấm **Try it out** ở bất kỳ API nào phía dưới (ví dụ \`GET /api/incidents/analytics\` hoặc \`GET /api/incidents\`) để xem dữ liệu thật!*`,
    contact: {
      name: 'Đào Duy Hải',
      url: 'https://github.com/DaoDuyHai/school-incident-dispatch',
    },
  },
  servers: [
    {
      url: 'https://school-incident-dispatch.fly.dev',
      description: 'Production Server (Fly.io Singapore)',
    },
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhập JWT Token nhận được từ endpoint /api/users/login',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description message' },
          requestId: {
            type: 'string',
            example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6adb4f9f534ccd47cc874e1' },
          userName: { type: 'string', example: 'student01' },
          fullName: { type: 'string', example: 'Nguyễn Văn A' },
          role: {
            type: 'string',
            enum: ['student', 'teacher', 'dispatcher', 'admin'],
            example: 'student',
          },
          department: {
            type: 'string',
            enum: ['TECHNICAL', 'MEDICAL'],
            nullable: true,
            example: 'TECHNICAL',
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Incident: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6adb4f9f534ccd47cc874e2' },
          title: {
            type: 'string',
            example: 'Máy chiếu phòng B204 không lên nguồn',
          },
          location: { type: 'string', example: 'Phòng học B204, Tòa B' },
          type: {
            type: 'string',
            enum: ['Hỏng điện/Nước/Thiết bị', 'Tai nạn/Sức khỏe/Cấp cứu'],
            example: 'Hỏng điện/Nước/Thiết bị',
          },
          department: {
            type: 'string',
            enum: ['TECHNICAL', 'MEDICAL'],
            example: 'TECHNICAL',
          },
          description: {
            type: 'string',
            example: 'Cần sửa gấp trong sáng nay',
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'],
            example: 'PENDING',
          },
          reporter: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              fullName: { type: 'string' },
              userName: { type: 'string' },
              department: { type: 'string', nullable: true },
            },
          },
          responder: {
            type: 'object',
            nullable: true,
            properties: {
              _id: { type: 'string' },
              fullName: { type: 'string' },
              userName: { type: 'string' },
              department: { type: 'string' },
            },
          },
          resolutionNotes: { type: 'string', nullable: true },
          resolvedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Analytics: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: 'Get incident analytics successfully.',
          },
          data: {
            type: 'object',
            properties: {
              summary: {
                type: 'object',
                properties: {
                  total: { type: 'number', example: 45 },
                  pending: { type: 'number', example: 5 },
                  inProgress: { type: 'number', example: 12 },
                  resolved: { type: 'number', example: 28 },
                },
              },
              byDepartment: {
                type: 'object',
                properties: {
                  TECHNICAL: { type: 'number', example: 30 },
                  MEDICAL: { type: 'number', example: 15 },
                },
              },
              topLocations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    location: { type: 'string', example: 'Phòng học B204' },
                    count: { type: 'number', example: 8 },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Readiness & Health Check Probe',
        description:
          'Kiểm tra tình trạng sống của container, kết nối MongoDB và tài nguyên bộ nhớ.',
        tags: ['System'],
        responses: {
          200: {
            description: 'Hệ thống hoạt động bình thường (UP)',
          },
          503: {
            description: 'Dịch vụ gặp sự cố kết nối Database (DOWN)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/users/register': {
      post: {
        summary: 'Đăng ký tài khoản mới',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userName', 'password', 'fullName'],
                properties: {
                  userName: { type: 'string', example: 'student_new' },
                  password: { type: 'string', example: '123456' },
                  fullName: { type: 'string', example: 'Lê Hoàng Nam' },
                  role: {
                    type: 'string',
                    enum: ['student', 'teacher', 'dispatcher', 'admin'],
                    example: 'student',
                  },
                  department: {
                    type: 'string',
                    enum: ['TECHNICAL', 'MEDICAL'],
                    description: 'Bắt buộc khi role là dispatcher',
                    example: 'TECHNICAL',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Tạo tài khoản thành công' },
          400: {
            description: 'Dữ liệu không hợp lệ hoặc thiếu trường bắt buộc',
          },
          409: { description: 'Tên người dùng đã tồn tại' },
        },
      },
    },
    '/api/users/login': {
      post: {
        summary: 'Đăng nhập lấy Token xác thực (JWT)',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userName', 'password'],
                properties: {
                  userName: { type: 'string', example: 'admin01' },
                  password: { type: 'string', example: '123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Đăng nhập thành công, trả về Bearer Token',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login successful.' },
                    token: {
                      type: 'string',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Sai tên đăng nhập hoặc mật khẩu' },
        },
      },
    },
    '/api/users/profile': {
      get: {
        summary: 'Lấy thông tin người dùng đang đăng nhập (Profile)',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Thông tin tài khoản đã giải mã từ Token',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: {
                      type: 'string',
                      example: 'Get user profile successfully.',
                    },
                    data: {
                      type: 'object',
                      properties: {
                        userId: { type: 'string' },
                        userName: { type: 'string' },
                        fullName: { type: 'string' },
                        role: { type: 'string' },
                        department: { type: 'string', nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Chưa đăng nhập hoặc token không hợp lệ' },
        },
      },
    },
    '/api/incidents': {
      post: {
        summary: 'Báo cáo sự cố mới (Học sinh / Giáo viên)',
        description:
          'Học sinh hoặc Giáo viên tạo sự cố mới. Hệ thống tự động phân loại phòng ban (TECHNICAL nếu hỏng thiết bị, MEDICAL nếu tai nạn) và phát thông báo WebSocket tới đúng phòng ban.',
        tags: ['Incidents (Reporter)'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'location', 'type'],
                properties: {
                  title: {
                    type: 'string',
                    example: 'Vòi nước bồn rửa nhà xe bị gãy phun nước',
                  },
                  location: { type: 'string', example: 'Khu vệ sinh Nhà xe A' },
                  type: {
                    type: 'string',
                    enum: [
                      'Hỏng điện/Nước/Thiết bị',
                      'Tai nạn/Sức khỏe/Cấp cứu',
                    ],
                    example: 'Hỏng điện/Nước/Thiết bị',
                  },
                  description: {
                    type: 'string',
                    example: 'Cần sửa gấp trong sáng nay',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Tạo sự cố thành công, trạng thái PENDING' },
          400: { description: 'Dữ liệu thiếu hoặc loại sự cố không hợp lệ' },
          403: { description: 'Chỉ học sinh hoặc giáo viên mới được báo cáo' },
        },
      },
      get: {
        summary: 'Lấy toàn bộ sự cố toàn trường (Admin - Phân trang & Lọc)',
        tags: ['Incidents (Admin)'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Số thứ tự trang (mặc định: 1)',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
            description: 'Số bản ghi trên mỗi trang (mặc định: 10)',
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'],
            },
            description: 'Lọc theo trạng thái sự cố',
          },
          {
            name: 'department',
            in: 'query',
            schema: { type: 'string', enum: ['TECHNICAL', 'MEDICAL'] },
            description: 'Lọc theo phòng ban phụ trách',
          },
        ],
        responses: {
          200: {
            description:
              'Danh sách sự cố phân trang kèm thông tin tổng bản ghi',
          },
          403: {
            description: 'Quyền truy cập bị từ chối (Chỉ dành cho Admin)',
          },
        },
      },
    },
    '/api/incidents/my-reports': {
      get: {
        summary: 'Xem danh sách sự cố do chính mình báo cáo (Reporter)',
        tags: ['Incidents (Reporter)'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Danh sách các sự cố do người dùng đăng nhập tạo ra',
          },
        },
      },
    },
    '/api/incidents/pending': {
      get: {
        summary: 'Xem danh sách sự cố đang chờ xử lý theo khoa (Dispatcher)',
        description:
          'Dispatcher chỉ xem được các sự cố có trạng thái PENDING thuộc đúng khoa mình phụ trách (TECHNICAL hoặc MEDICAL).',
        tags: ['Incidents (Dispatcher)'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description:
              'Danh sách các sự cố trạng thái PENDING thuộc khoa của Dispatcher',
          },
          403: {
            description: 'Chỉ nhân viên Dispatcher mới có quyền truy cập',
          },
        },
      },
    },
    '/api/incidents/my-tasks': {
      get: {
        summary: 'Xem danh sách sự cố do mình đang phụ trách (Dispatcher)',
        description:
          'Lấy danh sách các sự cố mà nhân viên điều phối hiện tại đã bấm nhận (responder = userId).',
        tags: ['Incidents (Dispatcher)'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Danh sách các ca sự cố được phân công cho mình',
          },
          403: {
            description: 'Chỉ nhân viên Dispatcher mới có quyền truy cập',
          },
        },
      },
    },
    '/api/incidents/{id}/accept': {
      patch: {
        summary: 'Tiếp nhận sự cố (Khóa nguyên tử chống Race Condition)',
        description:
          'Dispatcher bấm nhận xử lý sự cố. Sử dụng toán tử findOneAndUpdate nguyên tử. Nếu sự cố đã được đồng nghiệp nhận trước tại cùng một mili-giây, hệ thống lập tức chặn lại và phản hồi 409 Conflict.',
        tags: ['Incidents (Dispatcher)'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Mã ObjectId của sự cố',
          },
        ],
        responses: {
          200: {
            description:
              'Tiếp nhận thành công, trạng thái chuyển sang IN_PROGRESS',
          },
          403: {
            description: 'Nhân viên khác khoa không được tiếp nhận ca này',
          },
          409: {
            description:
              'Xung đột Race Condition: Sự cố đã được kỹ thuật viên khác tiếp nhận trước đó',
          },
        },
      },
    },
    '/api/incidents/{id}/resolve': {
      patch: {
        summary: 'Nghiệm thu hoàn tất sự cố (Dispatcher)',
        description:
          'Dispatcher hoàn thành công việc và đóng ca. Chỉ đúng người đã nhận ca (responder) mới được quyền nghiệm thu hoàn tất.',
        tags: ['Incidents (Dispatcher)'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Mã ObjectId của sự cố',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['resolutionNotes'],
                properties: {
                  resolutionNotes: {
                    type: 'string',
                    example:
                      'Đã thay mới van ống nước và kiểm tra áp lực chạy thử an toàn.',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description:
              'Nghiệm thu thành công, trạng thái chuyển sang RESOLVED',
          },
          400: {
            description:
              'Sự cố chưa ở trạng thái IN_PROGRESS hoặc thiếu ghi chú',
          },
          403: {
            description: 'Chỉ đúng người phụ trách ca mới được quyền đóng ca',
          },
        },
      },
    },
    '/api/incidents/analytics': {
      get: {
        summary:
          'Thống kê KPI & Phân tích điểm nóng (Admin - MongoDB Aggregation)',
        description:
          'Sử dụng MongoDB Aggregation Pipeline ($facet, $group, $sort) để tính toán số liệu tổng quan, tỷ lệ theo khoa và Top 3 vị trí hay xảy ra sự cố nhất.',
        tags: ['Analytics (Admin)'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description:
              'Thống kê tổng số, tỷ lệ theo khoa, và Top 3 điểm nóng sự cố',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Analytics' },
              },
            },
          },
          403: { description: 'Chỉ Admin mới có quyền truy cập' },
        },
      },
    },
  },
};

export default swaggerDocument;
