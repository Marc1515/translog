import { Module } from '@nestjs/common';
import { ShipmentsModule } from '../shipments/shipments.module.js';
import { TrackingController } from './tracking.controller.js';
import { TrackingService } from './tracking.service.js';

@Module({
  imports: [ShipmentsModule],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule {}
