import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { renderVoyagerPage } from 'graphql-voyager/middleware';

// This controller serves the GraphQL Voyager UI at the /voyager endpoint.
@Controller('voyager')
export class VoyagerController {
  @Get()
  getVoyager(@Res() res: Response) {
    res.send(renderVoyagerPage({ endpointUrl: '/graphql' }));
  }
}
