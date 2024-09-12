import { StringField } from '../../decorators';

export class CommonErrorResponseDto {
  @StringField()
  status: string | undefined;

  @StringField()
  message: string | undefined;

  error?: string;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  details?: any;
  constructor(errors: { status: string; message: string }) {
    this.status = errors.status;
    this.message = errors.message;
  }
}
