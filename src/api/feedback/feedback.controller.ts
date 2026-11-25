import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import {
  FeedbackFilterQueryDto,
  FeedbackListQueryDto,
} from './dto/feedback-query.dto.js';
import type { FeedbackFilters } from '../../modules/feedback/feedback.service.js';
import { ListFeedbackUseCase } from '../../usecases/feedback/list-feedback.usecase.js';
import { GetFeedbackSummaryUseCase } from '../../usecases/feedback/get-feedback-summary.usecase.js';
import { ExportFeedbackCsvUseCase } from '../../usecases/feedback/export-feedback-csv.usecase.js';

function toFilters(q: FeedbackFilterQueryDto): FeedbackFilters {
  return {
    from: q.from,
    to: q.to,
    found: q.found,
    fromKarabakh: q.fromKarabakh,
  };
}

@Controller('admin/feedback')
@Roles(Role.SUPER_ADMIN)
export class FeedbackController {
  constructor(
    private readonly listFeedback: ListFeedbackUseCase,
    private readonly getSummary: GetFeedbackSummaryUseCase,
    private readonly exportCsv: ExportFeedbackCsvUseCase,
  ) {}

  @Get()
  async list(@Query() query: FeedbackListQueryDto) {
    return this.listFeedback.execute(
      toFilters(query),
      query.page ?? 1,
      query.perPage ?? 10,
    );
  }

  @Get('summary')
  async summary(@Query() query: FeedbackFilterQueryDto) {
    return this.getSummary.execute(toFilters(query));
  }

  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async export(
    @Query() query: FeedbackFilterQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { filename, csv } = await this.exportCsv.execute(toFilters(query));
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return csv;
  }
}
