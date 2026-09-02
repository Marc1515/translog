import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TrackingService } from './tracking.service.js';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':trackingCode')
  findByTrackingCode(@Param('trackingCode') trackingCode: string) {
    return this.trackingService.findByTrackingCode(trackingCode);
  }
}
