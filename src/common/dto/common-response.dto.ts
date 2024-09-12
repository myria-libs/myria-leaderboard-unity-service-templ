import { StringField } from '../../decorators';

export class CommonResponseDto {
  @StringField()
  status: string | undefined;

  @StringField()
  message: string | undefined;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  data?: any;

  constructor(response: { status: string; message: string; data?: any }) {
    this.status = response.status;
    this.message = response.message;
    this.data = response.data;
  }
}
