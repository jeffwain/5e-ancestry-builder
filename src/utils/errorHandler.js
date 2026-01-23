/**
 * Global error handler for uncaught errors and unhandled promise rejections.
 * Call setupGlobalErrorHandling() once at app startup.
 */

const formatError = (error) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }
  return { message: String(error) };
};

const logError = (type, error, extra = {}) => {
  const errorInfo = formatError(error);

  console.group(`%c ${type}`, 'color: #ff6b6b; font-weight: bold; font-size: 14px;');
  console.error('Message:', errorInfo.message);

  if (errorInfo.stack) {
    console.error('Stack:', errorInfo.stack);
  }

  if (Object.keys(extra).length > 0) {
    console.error('Additional Info:', extra);
  }

  console.groupEnd();
};

export function setupGlobalErrorHandling() {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    logError('Uncaught Error', event.error || event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });

    // Prevent default browser error handling (optional)
    // event.preventDefault();
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError('Unhandled Promise Rejection', event.reason);

    // Prevent default browser handling (optional)
    // event.preventDefault();
  });

  console.log(
    '%c Error handling initialized',
    'color: #22c55e; font-weight: bold;',
    '- Errors will be logged with detailed formatting'
  );
}

/**
 * Wrap an async function with error handling.
 * Useful for event handlers and effects.
 *
 * Usage:
 *   const handleClick = safeAsync(async () => {
 *     await fetchData();
 *   }, 'handleClick');
 */
export function safeAsync(fn, context = 'anonymous') {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(`Async Error in ${context}`, error);
      throw error; // Re-throw so calling code can handle if needed
    }
  };
}

/**
 * Wrap a sync function with error handling.
 *
 * Usage:
 *   const parseData = safeFn((data) => JSON.parse(data), 'parseData');
 */
export function safeFn(fn, context = 'anonymous') {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      logError(`Error in ${context}`, error);
      throw error;
    }
  };
}

/**
 * Log an error manually with consistent formatting.
 *
 * Usage:
 *   try {
 *     riskyOperation();
 *   } catch (error) {
 *     logErrorManual('riskyOperation', error, { userId: 123 });
 *   }
 */
export function logErrorManual(context, error, extra = {}) {
  logError(`Error in ${context}`, error, extra);
}
