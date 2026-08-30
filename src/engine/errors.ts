import type { ValidationError } from './validation'

export class CalculationError extends Error {
  readonly code: string
  readonly userMessage: string

  constructor(code: string, userMessage: string) {
    super(userMessage)
    this.name = 'CalculationError'
    this.code = code
    this.userMessage = userMessage
  }
}

export function firstError(errors: ValidationError[]): ValidationError | undefined {
  return errors[0]
}
