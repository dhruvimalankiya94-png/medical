/**
 * OpenAPI 3.0 description of the HealthPulse user-facing REST API.
 *
 * Kept as a standalone module rather than as JSDoc comments spread across the
 * route files, so the specification can be read, reviewed and exported on its
 * own. Served by swagger-ui-express at GET /api/docs, and as raw JSON at
 * GET /api/docs.json.
 *
 * The hospital administration routes (patients, doctors, appointments,
 * departments, invoices, medicines, lab tests, hospital dashboard) are a planned
 * extension with no frontend yet. They are admin-only and intentionally not
 * documented here.
 */

const bearerAuth = [{ bearerAuth: [] }];

const ok = (description, schema) => ({
  description,
  content: { 'application/json': { schema } },
});

const errorResponse = (description) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
    },
  },
});

const STANDARD_ERRORS = {
  401: errorResponse('Missing, invalid or expired token'),
  429: errorResponse('Rate limit exceeded'),
  500: errorResponse('Unexpected server error'),
};

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'HealthPulse API',
    version: '1.0.0',
    description:
      'REST API for the Smart Healthcare Analytics System. Provides authentication, ' +
      'health record management, machine learning based diabetes risk assessment, ' +
      'a daily planner, aggregated reporting, threshold based health alerts and data export.\n\n' +
      '**Authentication.** All protected endpoints expect a JSON Web Token in the ' +
      '`Authorization` header using the `Bearer <token>` scheme. Obtain a token from ' +
      '`POST /api/auth/login` or `POST /api/auth/register`. Tokens are valid for 7 days.\n\n' +
      '**Rate limits.** Credential endpoints allow 10 requests per 15 minutes per IP. ' +
      'Password change and account deletion share a separate 10 request budget. ' +
      'All other `/api` routes allow 300 requests per 15 minutes.\n\n' +
      '**Medical disclaimer.** Risk predictions and alerts are generated for educational ' +
      'purposes only and must not be treated as a medical diagnosis.',
    license: { name: 'Educational use only' },
  },
  servers: [
    { url: 'http://localhost:5001/api', description: 'Local development' },
  ],
  tags: [
    { name: 'System', description: 'Service health' },
    { name: 'Authentication', description: 'Registration, login, password and account management' },
    { name: 'Health Records', description: 'Create and manage health records; triggers ML risk assessment' },
    { name: 'Risk Assessment', description: 'Machine learning diabetes risk prediction history' },
    { name: 'Daily Planner', description: 'Daily task tracking and activity streaks' },
    { name: 'Health Profile', description: 'Long lived profile data and daily goals' },
    { name: 'Reports', description: 'Weekly, monthly and time series summaries' },
    { name: 'Dashboard', description: 'Aggregated dashboard statistics' },
    { name: 'Alerts', description: 'Threshold based clinical screening alerts' },
    { name: 'Export', description: 'Data portability' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Not authorized, no token' } },
      },
      AuthUser: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6ab51a1acb9137be66d62980' },
          name: { type: 'string', example: 'Rahul Sharma' },
          email: { type: 'string', format: 'email', example: 'rahul.sharma@email.com' },
          role: { type: 'string', enum: ['admin', 'doctor', 'nurse', 'staff', 'patient'] },
          token: { type: 'string', description: 'JWT, valid for 7 days' },
        },
      },
      Preferences: {
        type: 'object',
        properties: {
          emailAlerts: { type: 'boolean', default: true },
          weeklyReportEmail: { type: 'boolean', default: true },
          criticalAlertEmail: { type: 'boolean', default: true },
          anonymizeData: { type: 'boolean', default: false },
          shareWithPhysician: { type: 'boolean', default: false },
        },
      },
      Vitals: {
        type: 'object',
        properties: {
          bpSystolic: { type: 'number', example: 128 },
          bpDiastolic: { type: 'number', example: 84 },
          heartRate: { type: 'number', example: 72 },
          temperature: { type: 'number', example: 98.4 },
          oxygenSaturation: { type: 'number', example: 98 },
          sugarFasting: { type: 'number', example: 141 },
          sugarPostMeal: { type: 'number', example: 162 },
          cholesterol: { type: 'number', example: 190 },
          cholesterolHDL: { type: 'number', example: 52 },
          cholesterolLDL: { type: 'number', example: 110 },
        },
      },
      HealthRecord: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          recordDate: { type: 'string', format: 'date-time' },
          recordType: { type: 'string', example: 'General Checkup' },
          type: { type: 'string', example: 'General Checkup' },
          doctor: { type: 'string', example: 'Dr Mehta' },
          vitals: { $ref: '#/components/schemas/Vitals' },
          weight: { type: 'number', example: 76.5 },
          height: { type: 'number', example: 171 },
          bmi: { type: 'number', example: 26.2 },
          sleepHours: { type: 'number', example: 6.5 },
          waterIntake: { type: 'number', example: 2.4 },
          exerciseMinutes: { type: 'number', example: 45 },
          caloriesIntake: { type: 'number', example: 2100 },
          stepsCount: { type: 'number', example: 8200 },
          mood: { type: 'string', enum: ['great', 'good', 'okay', 'bad', 'terrible'] },
          notes: { type: 'string' },
          status: {
            type: 'string',
            enum: ['Optimal', 'Good', 'Mild Watch', 'High Risk', 'Recorded'],
            description: 'Set from the ML risk level once a prediction succeeds',
          },
          pregnancies: { type: 'number' },
          glucose: { type: 'number' },
          bloodPressure: { type: 'number', description: 'Diastolic value used as an ML feature' },
          skinThickness: { type: 'number' },
          insulin: { type: 'number' },
          diabetesPedigreeFunction: { type: 'number' },
          age: { type: 'number' },
        },
      },
      HealthRecordInput: {
        type: 'object',
        required: ['glucose', 'bloodPressure', 'bmi', 'age'],
        properties: {
          type: { type: 'string', example: 'Full Panel' },
          doctor: { type: 'string', example: 'Dr Mehta' },
          vitals: { $ref: '#/components/schemas/Vitals' },
          glucose: { type: 'number', example: 141, description: 'Required. Plasma glucose in mg/dL' },
          bloodPressure: { type: 'number', example: 84, description: 'Required. Diastolic pressure in mmHg' },
          bmi: { type: 'number', example: 26.2, description: 'Required' },
          age: { type: 'number', example: 41, description: 'Required' },
          pregnancies: { type: 'number', example: 2 },
          skinThickness: { type: 'number', example: 26 },
          insulin: { type: 'number', example: 115 },
          diabetesPedigreeFunction: { type: 'number', example: 0.45 },
          weight: { type: 'number', example: 76.5 },
          height: { type: 'number', example: 171 },
          sleepHours: { type: 'number', example: 6.5 },
          waterIntake: { type: 'number', example: 2.4 },
          exerciseMinutes: { type: 'number', example: 45 },
          caloriesIntake: { type: 'number', example: 2100 },
          stepsCount: { type: 'number', example: 8200 },
          mood: { type: 'string', enum: ['great', 'good', 'okay', 'bad', 'terrible'] },
          notes: { type: 'string' },
        },
      },
      Assessment: {
        type: 'object',
        properties: {
          assessmentId: { type: 'string' },
          prediction: { type: 'integer', enum: [0, 1], description: '1 indicates a positive diabetes prediction' },
          riskProbability: { type: 'number', example: 0.232 },
          riskPercentage: { type: 'number', example: 23.2 },
          riskLevel: { type: 'string', enum: ['Low Risk', 'Moderate Risk', 'High Risk'] },
          keyContributingFactors: { type: 'array', items: { type: 'string' } },
          modelUsed: { type: 'string', example: 'RandomForestClassifier (Pima Indians Dataset)' },
          disclaimer: { type: 'string' },
        },
      },
      DailyTask: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          title: { type: 'string', example: 'Drink 2L Water' },
          category: {
            type: 'string',
            enum: ['exercise', 'water', 'medicine', 'walking', 'sleep', 'diet', 'other'],
          },
          targetValue: { type: 'number', example: 1 },
          currentValue: { type: 'number', example: 0 },
          unit: { type: 'string' },
          completed: { type: 'boolean' },
          taskDate: { type: 'string', format: 'date-time' },
        },
      },
      Alert: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'sugar-diabetic' },
          severity: { type: 'string', enum: ['critical', 'warning', 'info'] },
          metric: { type: 'string', example: 'Fasting Blood Sugar' },
          title: { type: 'string', example: 'Fasting sugar in diabetic range' },
          message: { type: 'string' },
          value: { type: 'string', nullable: true, example: '141 mg/dL' },
          threshold: { type: 'string', nullable: true, example: '126 mg/dL' },
          recordedOn: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 32 },
          totalPages: { type: 'integer', example: 2 },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Service health check',
        security: [],
        responses: {
          200: ok('Service is running', {
            type: 'object',
            properties: { status: { type: 'string', example: 'ok' }, message: { type: 'string' } },
          }),
        },
      },
    },

    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Create an account',
        description: 'Name, a valid email and a password of at least 8 characters are required.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Rahul Sharma' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8, example: 'Password123!' },
                  phone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: ok('Account created', { $ref: '#/components/schemas/AuthUser' }),
          400: errorResponse('Validation failed or the email is already registered'),
          429: STANDARD_ERRORS[429],
          500: STANDARD_ERRORS[500],
        },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Sign in and obtain a JWT',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'rahul.sharma@email.com' },
                  password: { type: 'string', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          200: ok('Authenticated', { $ref: '#/components/schemas/AuthUser' }),
          400: errorResponse('Validation failed'),
          401: errorResponse('Invalid credentials'),
          429: STANDARD_ERRORS[429],
          500: STANDARD_ERRORS[500],
        },
      },
    },

    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get the signed-in account',
        security: bearerAuth,
        responses: {
          200: ok('The current user, without the password hash', { $ref: '#/components/schemas/AuthUser' }),
          ...STANDARD_ERRORS,
        },
      },
      delete: {
        tags: ['Authentication'],
        summary: 'Permanently delete the account and all associated data',
        description:
          'Requires the account password. Cascades to health records, daily tasks, ' +
          'prediction history, the health profile and the uploaded avatar file.',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: { password: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: ok('Account deleted', {
            type: 'object',
            properties: {
              message: { type: 'string' },
              deleted: {
                type: 'object',
                properties: {
                  healthRecords: { type: 'integer' },
                  dailyTasks: { type: 'integer' },
                  predictionHistory: { type: 'integer' },
                  healthProfiles: { type: 'integer' },
                },
              },
            },
          }),
          400: errorResponse('Password confirmation missing'),
          401: errorResponse('Password is incorrect'),
          429: STANDARD_ERRORS[429],
          500: STANDARD_ERRORS[500],
        },
      },
    },

    '/auth/update-profile': {
      put: {
        tags: ['Authentication'],
        summary: 'Update name, phone or avatar path',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  avatar: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: ok('Updated account', { $ref: '#/components/schemas/AuthUser' }),
          404: errorResponse('User not found'),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/auth/upload-avatar': {
      post: {
        tags: ['Authentication'],
        summary: 'Upload a profile photo',
        description: 'Accepts jpeg, jpg, png or webp up to 2 MB.',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { avatar: { type: 'string', format: 'binary' } },
              },
            },
          },
        },
        responses: {
          200: ok('Stored path of the uploaded image', {
            type: 'object',
            properties: { avatar: { type: 'string', example: '/uploads/avatars/6ab5-1790253614.png' } },
          }),
          400: errorResponse('No file supplied or the file was rejected'),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Request a password reset link',
        description:
          'Emails a single use reset link that expires after 15 minutes. Only the SHA-256 ' +
          'digest of the token is stored. The response is identical whether or not the ' +
          'address is registered, so it cannot be used to enumerate accounts. When no SMTP ' +
          'credentials are configured the mail goes to a capture inbox and `previewUrl` is returned.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          200: ok('Reset link sent, if the account exists', {
            type: 'object',
            properties: {
              message: { type: 'string' },
              emailDelivery: { type: 'string', enum: ['smtp', 'ethereal'] },
              previewUrl: { type: 'string', nullable: true, description: 'Capture inbox only' },
            },
          }),
          400: errorResponse('Email missing'),
          502: errorResponse('The reset email could not be delivered'),
          429: STANDARD_ERRORS[429],
          500: STANDARD_ERRORS[500],
        },
      },
    },

    '/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Complete a password reset',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['resetToken', 'newPassword'],
                properties: {
                  resetToken: { type: 'string', description: '64 character token from the emailed link' },
                  newPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: ok('Password updated', { type: 'object', properties: { message: { type: 'string' } } }),
          400: errorResponse('Token invalid, already used or expired, or the password is too short'),
          429: STANDARD_ERRORS[429],
          500: STANDARD_ERRORS[500],
        },
      },
    },

    '/auth/change-password': {
      put: {
        tags: ['Authentication'],
        summary: 'Change the password of the signed-in user',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: ok('Password changed', { type: 'object', properties: { message: { type: 'string' } } }),
          400: errorResponse('New password too short, missing, or identical to the current one'),
          401: errorResponse('Current password is incorrect'),
          429: STANDARD_ERRORS[429],
          500: STANDARD_ERRORS[500],
        },
      },
    },

    '/auth/preferences': {
      get: {
        tags: ['Authentication'],
        summary: 'Read account preferences',
        security: bearerAuth,
        responses: {
          200: ok('Current preferences', { $ref: '#/components/schemas/Preferences' }),
          ...STANDARD_ERRORS,
        },
      },
      put: {
        tags: ['Authentication'],
        summary: 'Update account preferences',
        description: 'Only the five preference flags are writable; any other field in the body is ignored.',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Preferences' } } },
        },
        responses: {
          200: ok('Saved preferences', {
            type: 'object',
            properties: {
              message: { type: 'string' },
              preferences: { $ref: '#/components/schemas/Preferences' },
            },
          }),
          404: errorResponse('User not found'),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/records': {
      post: {
        tags: ['Health Records'],
        summary: 'Create a health record and run a diabetes risk assessment',
        description:
          'Saves the record, then calls the Python FastAPI service for a prediction. ' +
          'If the ML service is unavailable the record is still stored and the response ' +
          'carries `mlServiceError` instead of `assessment`.',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthRecordInput' } } },
        },
        responses: {
          201: ok('Record created, with or without a prediction', {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              record: { $ref: '#/components/schemas/HealthRecord' },
              assessment: { $ref: '#/components/schemas/Assessment' },
              mlServiceError: { type: 'string', description: 'Present only when the ML service failed' },
            },
          }),
          400: errorResponse('One of glucose, bloodPressure, bmi or age is missing'),
          ...STANDARD_ERRORS,
        },
      },
      get: {
        tags: ['Health Records'],
        summary: 'List health records, newest first',
        security: bearerAuth,
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Matches type, doctor or notes' },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['All', 'Optimal', 'Good', 'Mild Watch', 'High Risk', 'Recorded'] },
          },
        ],
        responses: {
          200: ok('Paginated records', {
            type: 'object',
            properties: {
              records: { type: 'array', items: { $ref: '#/components/schemas/HealthRecord' } },
              pagination: { $ref: '#/components/schemas/Pagination' },
            },
          }),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/records/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        tags: ['Health Records'],
        summary: 'Get one health record',
        security: bearerAuth,
        responses: {
          200: ok('The record', { $ref: '#/components/schemas/HealthRecord' }),
          403: errorResponse('The record belongs to another user'),
          404: errorResponse('Record not found'),
          ...STANDARD_ERRORS,
        },
      },
      put: {
        tags: ['Health Records'],
        summary: 'Update a health record',
        description:
          'Only descriptive, body, lifestyle and vitals fields are writable. The owning user, ' +
          'the ML derived status and the timestamps cannot be changed through this endpoint.',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthRecordInput' } } },
        },
        responses: {
          200: ok('Updated record', { $ref: '#/components/schemas/HealthRecord' }),
          403: errorResponse('The record belongs to another user'),
          404: errorResponse('Record not found'),
          ...STANDARD_ERRORS,
        },
      },
      delete: {
        tags: ['Health Records'],
        summary: 'Delete a health record and its prediction history',
        security: bearerAuth,
        responses: {
          200: ok('Deleted', { type: 'object', properties: { message: { type: 'string' } } }),
          403: errorResponse('The record belongs to another user'),
          404: errorResponse('Record not found'),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/risk-assessment/history': {
      get: {
        tags: ['Risk Assessment'],
        summary: 'List past risk assessments, newest first',
        security: bearerAuth,
        responses: {
          200: ok('Prediction history with the source record populated', {
            type: 'array',
            items: {
              allOf: [
                { $ref: '#/components/schemas/Assessment' },
                {
                  type: 'object',
                  properties: { healthRecord: { $ref: '#/components/schemas/HealthRecord' } },
                },
              ],
            },
          }),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/risk-assessment/{id}': {
      get: {
        tags: ['Risk Assessment'],
        summary: 'Get one risk assessment',
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: ok('The assessment', { $ref: '#/components/schemas/Assessment' }),
          403: errorResponse('The assessment belongs to another user'),
          404: errorResponse('Assessment not found'),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/daily-tasks': {
      get: {
        tags: ['Daily Planner'],
        summary: 'List tasks for a day',
        security: bearerAuth,
        parameters: [
          {
            name: 'date',
            in: 'query',
            schema: { type: 'string', format: 'date' },
            description: 'Defaults to today',
          },
        ],
        responses: {
          200: ok('Tasks for that day', { type: 'array', items: { $ref: '#/components/schemas/DailyTask' } }),
          ...STANDARD_ERRORS,
        },
      },
      post: {
        tags: ['Daily Planner'],
        summary: 'Create a task',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Evening Walk' },
                  category: {
                    type: 'string',
                    enum: ['exercise', 'water', 'medicine', 'walking', 'sleep', 'diet', 'other'],
                  },
                  targetValue: { type: 'number' },
                  unit: { type: 'string' },
                  taskDate: { type: 'string', format: 'date' },
                },
              },
            },
          },
        },
        responses: {
          201: ok('Task created', { $ref: '#/components/schemas/DailyTask' }),
          400: errorResponse('Title is required'),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/daily-tasks/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      put: {
        tags: ['Daily Planner'],
        summary: 'Update a task',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  completed: { type: 'boolean' },
                  title: { type: 'string' },
                  category: { type: 'string' },
                  currentValue: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          200: ok('Updated task', { $ref: '#/components/schemas/DailyTask' }),
          403: errorResponse('The task belongs to another user'),
          404: errorResponse('Task not found'),
          ...STANDARD_ERRORS,
        },
      },
      delete: {
        tags: ['Daily Planner'],
        summary: 'Delete a task',
        security: bearerAuth,
        responses: {
          200: ok('Deleted', { type: 'object', properties: { message: { type: 'string' } } }),
          403: errorResponse('The task belongs to another user'),
          404: errorResponse('Task not found'),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/daily-tasks/streak': {
      get: {
        tags: ['Daily Planner'],
        summary: 'Activity streak summary',
        security: bearerAuth,
        responses: {
          200: ok('Streak counters', {
            type: 'object',
            properties: {
              currentStreak: { type: 'integer' },
              longestStreak: { type: 'integer' },
              weeklyStreak: { type: 'integer' },
              monthlyStreak: { type: 'integer' },
              totalTasks: { type: 'integer' },
              completedTasks: { type: 'integer' },
            },
          }),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/daily-tasks/history': {
      get: {
        tags: ['Daily Planner'],
        summary: 'Per-day task completion history',
        security: bearerAuth,
        parameters: [{ name: 'days', in: 'query', schema: { type: 'integer', default: 30 } }],
        responses: {
          200: ok('One zero-filled entry per day', {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', format: 'date' },
                total: { type: 'integer' },
                completed: { type: 'integer' },
                completionRate: { type: 'number' },
              },
            },
          }),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/health-profile': {
      get: {
        tags: ['Health Profile'],
        summary: 'Get the health profile',
        description: 'Returns 200 with a null body when the user has no profile yet.',
        security: bearerAuth,
        responses: {
          200: ok('The profile, including the derived age and bmi virtuals', {
            type: 'object',
            nullable: true,
          }),
          ...STANDARD_ERRORS,
        },
      },
      post: {
        tags: ['Health Profile'],
        summary: 'Create the health profile',
        security: bearerAuth,
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: {
          201: ok('Profile created', { type: 'object' }),
          400: errorResponse('A profile already exists for this user'),
          ...STANDARD_ERRORS,
        },
      },
      put: {
        tags: ['Health Profile'],
        summary: 'Update the health profile, creating it if absent',
        security: bearerAuth,
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
        responses: {
          200: ok('Profile updated', { type: 'object' }),
          201: ok('Profile created', { type: 'object' }),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/reports/weekly': {
      get: {
        tags: ['Reports'],
        summary: 'Seven day health report',
        security: bearerAuth,
        responses: {
          200: ok('Summary plus a per-day breakdown', {
            type: 'object',
            properties: {
              period: { type: 'object', properties: { start: { type: 'string' }, end: { type: 'string' } } },
              summary: { type: 'object' },
              dailyBreakdown: { type: 'array', items: { type: 'object' } },
            },
          }),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/reports/monthly': {
      get: {
        tags: ['Reports'],
        summary: 'Thirty day health report',
        security: bearerAuth,
        responses: {
          200: ok('Summary plus a per-week breakdown', {
            type: 'object',
            properties: {
              period: { type: 'object' },
              summary: { type: 'object' },
              weeklyBreakdown: { type: 'array', items: { type: 'object' } },
            },
          }),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/reports/vitals-history': {
      get: {
        tags: ['Reports'],
        summary: 'Time series of vitals and lifestyle metrics',
        description: 'Ordered oldest first and keyed on the clinical record date. Drives the analytics charts.',
        security: bearerAuth,
        parameters: [{ name: 'days', in: 'query', schema: { type: 'integer', default: 7 } }],
        responses: {
          200: ok('One entry per record', {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', format: 'date' },
                bpSystolic: { type: 'number' },
                bpDiastolic: { type: 'number' },
                sugar: { type: 'number' },
                heartRate: { type: 'number' },
                bmi: { type: 'number' },
                sleepHours: { type: 'number' },
                waterIntake: { type: 'number' },
                exerciseMinutes: { type: 'number' },
                caloriesIntake: { type: 'number' },
                weight: { type: 'number' },
                mood: { type: 'string' },
              },
            },
          }),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/user/dashboard/stats': {
      get: {
        tags: ['Dashboard'],
        summary: 'Aggregated dashboard statistics',
        description: 'The health score is a rule based composite of the latest in-range vitals, not an ML output.',
        security: bearerAuth,
        responses: {
          200: ok('Dashboard counters', {
            type: 'object',
            properties: {
              healthScore: { type: 'integer', example: 93 },
              bmi: { type: 'number' },
              waterIntake: { type: 'number' },
              waterGoal: { type: 'number' },
              sleepHours: { type: 'number' },
              sleepGoal: { type: 'number' },
              exerciseMinutes: { type: 'number' },
              exerciseGoal: { type: 'number' },
              tasksCompleted: { type: 'integer' },
              tasksTotal: { type: 'integer' },
              currentStreak: { type: 'integer' },
              totalRecords: { type: 'integer' },
              latestRecord: { type: 'object', nullable: true },
            },
          }),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/alerts': {
      get: {
        tags: ['Alerts'],
        summary: 'Threshold based health alerts',
        description:
          'Screens the most recent health record against published clinical reference ranges ' +
          '(AHA blood pressure categories, ADA fasting glucose criteria, WHO BMI classification) ' +
          'and returns the breaches, most severe first.',
        security: bearerAuth,
        responses: {
          200: ok('Alerts with severity counts', {
            type: 'object',
            properties: {
              alerts: { type: 'array', items: { $ref: '#/components/schemas/Alert' } },
              counts: {
                type: 'object',
                properties: {
                  total: { type: 'integer' },
                  critical: { type: 'integer' },
                  warning: { type: 'integer' },
                  info: { type: 'integer' },
                },
              },
              disclaimer: { type: 'string' },
            },
          }),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/alerts/thresholds': {
      get: {
        tags: ['Alerts'],
        summary: 'The clinical thresholds used by the alert engine',
        security: bearerAuth,
        responses: {
          200: ok('Threshold constants', { type: 'object' }),
          ...STANDARD_ERRORS,
        },
      },
    },

    '/export/records.csv': {
      get: {
        tags: ['Export'],
        summary: 'Download all health records as CSV',
        description: 'UTF-8 with a byte order mark so spreadsheet software reads it correctly.',
        security: bearerAuth,
        responses: {
          200: {
            description: 'CSV attachment',
            content: { 'text/csv': { schema: { type: 'string' } } },
          },
          ...STANDARD_ERRORS,
        },
      },
    },

    '/export/all.json': {
      get: {
        tags: ['Export'],
        summary: 'Download the full account data set as JSON',
        description: 'Includes the account, health profile, health records, daily tasks and prediction history.',
        security: bearerAuth,
        responses: {
          200: {
            description: 'JSON attachment',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    exportedAt: { type: 'string', format: 'date-time' },
                    exportVersion: { type: 'integer' },
                    account: { type: 'object' },
                    healthProfile: { type: 'object', nullable: true },
                    healthRecords: { type: 'array', items: { $ref: '#/components/schemas/HealthRecord' } },
                    dailyTasks: { type: 'array', items: { $ref: '#/components/schemas/DailyTask' } },
                    predictionHistory: { type: 'array', items: { type: 'object' } },
                    counts: { type: 'object' },
                  },
                },
              },
            },
          },
          ...STANDARD_ERRORS,
        },
      },
    },
  },
};

module.exports = openapi;
