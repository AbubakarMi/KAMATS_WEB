import type { RuleObject } from 'antd/es/form';
import type { z } from 'zod';

/**
 * Create an Ant Design Form rule that validates a single field
 * against a Zod schema. Returns the first Zod error for the field.
 */
export function zodValidator(
  schema: z.ZodObject<z.ZodRawShape>,
  fieldName: string,
): RuleObject {
  return {
    async validator(_rule: RuleObject, value: unknown) {
      // Build a partial object with just this field
      const partial = { [fieldName]: value };
      const result = await schema.partial().safeParseAsync(partial);

      if (result.success) return;

      const fieldError = result.error.issues.find(
        (issue) => issue.path[0] === fieldName,
      );

      if (fieldError) {
        throw new Error(fieldError.message);
      }
    },
  };
}
