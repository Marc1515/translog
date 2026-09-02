import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../../auth/types/authenticated-request.type.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { ShipmentsService } from '../application/shipments.service.js';
import { AssignVehiclesDto } from './dto/assign-vehicles.dto.js';
import { CreateShipmentDto } from './dto/create-shipment.dto.js';
import { ListShipmentsQueryDto } from './dto/list-shipments-query.dto.js';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto.js';

@ApiTags('Shipments')
@ApiBearerAuth()
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

  @Post('assign-vehicles')
  @HttpCode(HttpStatus.OK)
  assignVehicles(@Body() dto: AssignVehiclesDto) {
    return this.shipmentsService.assignVehicles(dto);
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentsService.findById(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShipmentStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.shipmentsService.updateStatus(id, dto, req.user.id);
  }

  @Delete(':id')
  cancel(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.shipmentsService.cancel(id, req.user.id);
  }
}
