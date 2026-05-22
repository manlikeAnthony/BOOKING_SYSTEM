type SuccessResponse<T> = {
    success : true
    message : string,
    data : T,
    code?: string,
}

export const successResponse = <T>({
  message,
  data,
  code,
}: {
  message: string;
  data: T;
  code?: string;
}): SuccessResponse<T> => {
  return {
    success: true,
    message,
    data,
    code,
  };
};