export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

const DEFAULT_MESSAGES = {
  [ERROR_TYPES.NETWORK_ERROR]: 'Không thể kết nối Internet. Vui lòng kiểm tra kết nối và thử lại.',
  [ERROR_TYPES.INVALID_CREDENTIALS]: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
  [ERROR_TYPES.ACCOUNT_DISABLED]: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.',
  [ERROR_TYPES.PERMISSION_DENIED]: 'Bạn không có quyền thực hiện thao tác này.',
  [ERROR_TYPES.NOT_FOUND]: 'Không tìm thấy dữ liệu yêu cầu.',
  [ERROR_TYPES.CONFLICT]: 'Dữ liệu này đã được thay đổi bởi người dùng khác. Vui lòng tải lại dữ liệu mới nhất.',
  [ERROR_TYPES.VALIDATION_ERROR]: 'Dữ liệu nhập vào không hợp lệ. Vui lòng kiểm tra lại.',
  [ERROR_TYPES.RATE_LIMITED]: 'Thao tác quá nhanh hoặc tài khoản tạm thời bị giới hạn. Vui lòng thử lại sau ít phút.',
  [ERROR_TYPES.TIMEOUT]: 'Yêu cầu mất nhiều thời gian hơn bình thường. Vui lòng thử lại.',
  [ERROR_TYPES.SERVER_ERROR]: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
  [ERROR_TYPES.UNKNOWN_ERROR]: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
};

/**
 * Normalize any error (Firebase, DOM, Network, Custom) into a consistent UI-friendly error object.
 * Specific business/validation errors are strictly checked BEFORE generic offline status.
 */
export function normalizeError(error) {
  if (typeof import.meta !== 'undefined' && import.meta?.env?.DEV) {
    console.error('[Error Details for Dev]:', error);
  }

  if (!error) {
    return {
      isNormalized: true,
      type: ERROR_TYPES.UNKNOWN_ERROR,
      message: DEFAULT_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR],
      code: 'unknown'
    };
  }

  // If already normalized
  if (error.isNormalized) {
    return error;
  }

  const code = (error.code || error.name || '').toLowerCase();
  const rawMsg = (error.message || '').toLowerCase();

  // 1. Concurrency Conflict (Highest priority business error)
  if (code === 'conflict' || error.code === 'CONFLICT' || rawMsg.includes('conflict') || rawMsg.includes('thay đổi bởi người dùng khác')) {
    return {
      isNormalized: true,
      type: ERROR_TYPES.CONFLICT,
      message: error.message && error.message.includes('thay đổi') ? error.message : DEFAULT_MESSAGES[ERROR_TYPES.CONFLICT],
      code: 'conflict'
    };
  }

  // 2. Validation Errors
  if (
    code === 'validation' ||
    error.name === 'ValidationError' ||
    error.code === 'VALIDATION' ||
    rawMsg.includes('phải là số') ||
    rawMsg.includes('is required') ||
    rawMsg.includes('không hợp lệ') ||
    rawMsg.includes('thiếu expectedversion')
  ) {
    return {
      isNormalized: true,
      type: ERROR_TYPES.VALIDATION_ERROR,
      message: error.message || DEFAULT_MESSAGES[ERROR_TYPES.VALIDATION_ERROR],
      code: 'validation_error'
    };
  }

  // 3. Permission & Access Control
  if (
    code.includes('permission-denied') ||
    code.includes('unauthorized') ||
    rawMsg.includes('permission') ||
    rawMsg.includes('quyền')
  ) {
    return {
      isNormalized: true,
      type: ERROR_TYPES.PERMISSION_DENIED,
      message: DEFAULT_MESSAGES[ERROR_TYPES.PERMISSION_DENIED],
      code: error.code || 'permission_denied'
    };
  }

  // 4. Resource Not Found
  if (
    code === 'not-found' ||
    error.code === 'NOT_FOUND' ||
    rawMsg.includes('not found') ||
    rawMsg.includes('không tồn tại') ||
    rawMsg.includes('đã bị xóa')
  ) {
    return {
      isNormalized: true,
      type: ERROR_TYPES.NOT_FOUND,
      message: error.message || DEFAULT_MESSAGES[ERROR_TYPES.NOT_FOUND],
      code: 'not_found'
    };
  }

  // 5. Authentication Specifics
  if (
    code.includes('invalid-credential') ||
    code.includes('user-not-found') ||
    code.includes('wrong-password') ||
    code.includes('invalid-email') ||
    code.includes('missing-password') ||
    rawMsg.includes('sai tên tài khoản') ||
    rawMsg.includes('profile not found')
  ) {
    return {
      isNormalized: true,
      type: ERROR_TYPES.INVALID_CREDENTIALS,
      message: DEFAULT_MESSAGES[ERROR_TYPES.INVALID_CREDENTIALS],
      code: error.code || 'invalid_credentials'
    };
  }

  if (code.includes('user-disabled') || rawMsg.includes('disabled')) {
    return {
      isNormalized: true,
      type: ERROR_TYPES.ACCOUNT_DISABLED,
      message: DEFAULT_MESSAGES[ERROR_TYPES.ACCOUNT_DISABLED],
      code: error.code || 'account_disabled'
    };
  }

  if (code.includes('too-many-requests')) {
    return {
      isNormalized: true,
      type: ERROR_TYPES.RATE_LIMITED,
      message: DEFAULT_MESSAGES[ERROR_TYPES.RATE_LIMITED],
      code: error.code || 'rate_limited'
    };
  }

  // 6. Network & Timeout Errors (Explicit API or Fetch failure)
  if (
    code.includes('network-request-failed') ||
    code.includes('unavailable') ||
    rawMsg.includes('network error') ||
    rawMsg.includes('failed to fetch') ||
    rawMsg.includes('load failed')
  ) {
    return {
      isNormalized: true,
      type: ERROR_TYPES.NETWORK_ERROR,
      message: DEFAULT_MESSAGES[ERROR_TYPES.NETWORK_ERROR],
      code: error.code || 'network_error'
    };
  }

  if (code.includes('timeout') || code.includes('deadline-exceeded') || rawMsg.includes('timeout')) {
    return {
      isNormalized: true,
      type: ERROR_TYPES.TIMEOUT,
      message: DEFAULT_MESSAGES[ERROR_TYPES.TIMEOUT],
      code: error.code || 'timeout'
    };
  }

  // 7. Generic Offline Fallback (Only if no specific error matched above)
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      isNormalized: true,
      type: ERROR_TYPES.NETWORK_ERROR,
      message: DEFAULT_MESSAGES[ERROR_TYPES.NETWORK_ERROR],
      code: 'offline'
    };
  }

  // 8. Internal Server Error
  if (code.includes('internal') || code.includes('server-error')) {
    return {
      isNormalized: true,
      type: ERROR_TYPES.SERVER_ERROR,
      message: DEFAULT_MESSAGES[ERROR_TYPES.SERVER_ERROR],
      code: error.code || 'server_error'
    };
  }

  // Fallback safe message
  return {
    isNormalized: true,
    type: ERROR_TYPES.UNKNOWN_ERROR,
    message: DEFAULT_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR],
    code: error.code || 'unknown'
  };
}
