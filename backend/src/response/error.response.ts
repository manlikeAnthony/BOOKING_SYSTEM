type ErrorResponse = {
  success: false;
  message: string;
  error?: unknown;
  code?: string;
};

export const errorResponse = ({
  message,
  error,
  code,
}: {
  message: string;
  error?: unknown;
  code?: string;
}): ErrorResponse => {
  return {
    success: false,
    message,
    error,
    code,
  };
};
