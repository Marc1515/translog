import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ShipmentsService } from './application/shipments.service.js';
import { ShipmentsRepository } from './infrastructure/shipments.repository.js';
import { ShipmentsController } from './presentation/shipments.controller.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService, ShipmentsRepository],
})
export class ShipmentsModule {}
