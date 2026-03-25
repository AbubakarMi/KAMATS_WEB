import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';

interface FieldError {
  field: string;
  message: string;
}

interface ApiErrorShape {
  status?: number;
  code?: string;
  message?: string;
  errors?: FieldError[];
}

/**
 * Normalise the error thrown by RTK Query's `.unwrap()`.
 *
 * Depending on the baseQuery implementation the shape can be either:
 *   - Direct: `{ status, code, message, errors?, traceId }` (our axiosBaseQuery)
 *   - Wrapped: `{ status, data: { code, message, errors?, traceId } }` (fetchBaseQuery style)
 */
function extractApiError(error: unknown): ApiErrorShape | undefined {
  if (!error || typeof error !== 'object') return undefined;

  const err = error as Record<string, unknown>;

  // Wrapped shape — { data: { message, errors, ... } }
  if (err.data && typeof err.data === 'object') {
    return err.data as ApiErrorShape;
  }

  // Direct shape — { message, errors, code, ... }
  if ('message' in err || 'errors' in err || 'code' in err) {
    return err as unknown as ApiErrorShape;
  }

  return undefined;
}

/**
 * Extract field-level errors from an API error response
 * and map them to React Hook Form field errors.
 *
 * Returns `undefined` when field errors were set on the form,
 * or a fallback message string suitable for `toast.error()`.
 */
export function setApiFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: unknown,
): string | undefined {
  const apiErr = extractApiError(error);
  const fieldErrors = apiErr?.errors;

  if (fieldErrors && fieldErrors.length > 0) {
    for (const fe of fieldErrors) {
      setError(fe.field as Path<T>, { message: fe.message });
    }
    return undefined;
  }

  return apiErr?.message || 'Operation failed';
}
