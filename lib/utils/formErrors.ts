import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';

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
 * and map them to React Hook Form field errors.
 */
export function setApiFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: unknown,
): string | undefined {
  const apiErr = error as ApiErrorResponse;
  const fieldErrors = apiErr?.data?.errors;

  if (fieldErrors && fieldErrors.length > 0) {
    for (const fe of fieldErrors) {
      setError(fe.field as Path<T>, { message: fe.message });
    }
    return undefined;
  }

  return apiErr?.data?.message || 'Operation failed';
}
