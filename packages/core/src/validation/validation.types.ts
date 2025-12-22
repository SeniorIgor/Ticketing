export interface ValidationSuccess {
  valid: true;
}

export interface ValidationFailure<E extends string = string> {
  valid: false;
  error: E;
  message: string;
}

export type ValidationResult<E extends string = string> = ValidationSuccess | ValidationFailure<E>;
