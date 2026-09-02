import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ShipmentsModule } from './shipments/shipments.module.js';
import { TrackingModule } from './tracking/tracking.module.js';

@Module({
  imports: [PrismaModule, AuthModule, ShipmentsModule, TrackingModule],
})
export class AppModule {}
