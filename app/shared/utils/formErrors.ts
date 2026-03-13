import type { FormInstance } from 'antd';

interface FieldError {
  field: string;
  message: string;
}

interface ApiErrorResponse {
  data?: {
    errors?: FieldError[];
    message?: string;
  };
  status?: number;
}

/**
 * Extract field-level errors from an API error response
 * and map them to Ant Design form field errors.
 */
export function setApiFieldErrors(
  form: FormInstance,
  error: unknown,
): string | undefined {
  const apiErr = error as ApiErrorResponse;
  const fieldErrors = apiErr?.data?.errors;

  if (fieldErrors && fieldErrors.length > 0) {
    form.setFields(
      fieldErrors.map((fe) => ({
        name: fe.field,
        errors: [fe.message],
      })),
    );
    return undefined;
  }

  return apiErr?.data?.message || 'Operation failed';
}
