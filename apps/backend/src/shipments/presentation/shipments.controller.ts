import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../auth/types/authenticated-request.type.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { ShipmentsService } from '../application/shipments.service.js';
import { CreateShipmentDto } from './dto/create-shipment.dto.js';
import { ListShipmentsQueryDto } from './dto/list-shipments-query.dto.js';

@Controller('shipments')
@UseGuards(JwtAuthGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateShipmentDto, @Req() req: AuthenticatedRequest) {
    return this.shipmentsService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Query() query: ListShipmentsQueryDto) {
    return this.shipmentsService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentsService.findById(id);
  }
}
