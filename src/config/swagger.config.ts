import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { ONE_MB } from '../constants';

const FILE_OBJECT = {
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
};

const FILE_SIZE_CONF = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: 'csv',
  })
  .addMaxSizeValidator({
    maxSize: 10 * ONE_MB,
  })
  .build({
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  });

const SWAGGER_CONFIG = {
  FILE_OBJECT,
  FILE_SIZE_CONF,
};

export { SWAGGER_CONFIG };
