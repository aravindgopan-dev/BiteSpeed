export const createError = (message: string, statusCode: number = 500) => {
    return {
      message,
      statusCode,
      status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
    };
  };
  