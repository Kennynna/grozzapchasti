import { ValidationError } from 'class-validator';

const MISSING_CONSTRAINTS = new Set(['isNotEmpty', 'isDefined']);

export function flattenValidationErrors(errors: ValidationError[]): string[] {
  const details: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      const missingKey = Object.keys(error.constraints).find((key) =>
        MISSING_CONSTRAINTS.has(key),
      );
      if (missingKey) {
        details.push(error.constraints[missingKey]);
      } else {
        for (const [key, message] of Object.entries(error.constraints)) {
          details.push(
            key === 'whitelistValidation'
              ? `Неизвестное поле: ${error.property}`
              : message,
          );
        }
      }
    }
    if (error.children?.length) {
      details.push(...flattenValidationErrors(error.children));
    }
  }

  return details;
}

export function hasMissingFields(errors: ValidationError[]): boolean {
  return errors.some((error) => {
    const keys = Object.keys(error.constraints ?? {});
    if (keys.some((key) => MISSING_CONSTRAINTS.has(key))) {
      return true;
    }
    return error.children?.length ? hasMissingFields(error.children) : false;
  });
}
