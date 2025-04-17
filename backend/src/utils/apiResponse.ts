export const apiResponse = {
    success: (data: any, message: string = 'Success') => {
      return {
        success: true,
        message,
        data,
      };
    },
    error: (message: string = 'Error', error: any = null) => {
      return {
        success: false,
        message,
        error,
      };
    },
  };