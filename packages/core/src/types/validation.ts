export interface ValidationResult<E extends string = string> {
  valid: boolean;
  error?: E;
  message?: string;
}

export interface FieldError<E extends string = string> {
  code: E;
  message: string;
}

export type ValidationErrors<Fields extends string, ErrorCode extends string = string> = Partial<
  Record<Fields, FieldError<ErrorCode>>
>;
