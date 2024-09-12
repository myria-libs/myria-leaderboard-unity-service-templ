import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EOrderBy {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class PaginationParamDto {
    @ApiPropertyOptional({
        description: 'The number of items to return',
        example: 10,
    })
    limit?: number;

    @ApiPropertyOptional({
        description: 'The page number for pagination',
        example: 1,
    })
    page?: number;

}
export class QueryScoreParamsDto extends PaginationParamDto {
    @ApiPropertyOptional({
        description: 'Field to sort by',
        example: 'score',
    })
    sortingField?: string;

    @ApiPropertyOptional({
        description: 'Order by ascending or descending',
        enum: EOrderBy,
        example: EOrderBy.ASC,
    })
    orderBy?: EOrderBy;

    @ApiPropertyOptional({
        description: 'User Id to query scores of leaderboard',
        example: '10',
    })
    userId?: string;

    @ApiPropertyOptional({
        description: 'The period that the score is captured for specific players',
        example: 1,
    })
    period?: number;
}

export class QueryScoreByUserIdParamsDto {
    @ApiPropertyOptional({
        description: 'The period that the score is captured for specific players',
        example: 1,
    })
    period?: number;
}