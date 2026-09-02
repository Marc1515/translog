import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentStatus } from '../generated/prisma/client.js';
import { ShipmentsRepository } from '../shipments/infrastructure/shipments.repository.js';
import { TrackingService } from './tracking.service.js';

describe('TrackingService', () => {
  let service: TrackingService;
  const repository = {
    findByTrackingCodeWithEvents: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        { provide: ShipmentsRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(TrackingService);
  });

  it('throws NotFoundException when tracking code does not exist', async () => {
    repository.findByTrackingCodeWithEvents.mockResolvedValue(null);

    await expect(
      service.findByTrackingCode('ENV-20260902-A7F2'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws BadRequestException for invalid tracking code format', async () => {
    await expect(service.findByTrackingCode('INVALID')).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(repository.findByTrackingCodeWithEvents).not.toHaveBeenCalled();
  });

  it('does not expose internal user identifiers in the response', async () => {
    repository.findByTrackingCodeWithEvents.mockResolvedValue({
      id: 'shipment-id',
      trackingCode: 'ENV-20260902-A7F2',
      originAddress: 'Madrid',
      destinationAddress: 'Barcelona',
      recipientName: 'Carlos García',
      contactPhone: '+34600111222',
      weight: 12.5,
      status: ShipmentStatus.IN_TRANSIT,
      deliveredAt: null,
      createdById: 'user-id',
      createdAt: new Date('2026-09-02T09:00:00.000Z'),
      updatedAt: new Date('2026-09-02T10:00:00.000Z'),
      events: [
        {
          status: ShipmentStatus.CREATED,
          location: null,
          notes: null,
          createdAt: new Date('2026-09-02T09:00:00.000Z'),
        },
      ],
    });

    const result = await service.findByTrackingCode('ENV-20260902-A7F2');
    const serialized = JSON.stringify(result);

    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('createdById');
    expect(result).not.toHaveProperty('contactPhone');
    expect(serialized).not.toMatch(/userId|createdById|contactPhone|email|passwordHash/i);
    expect(result.weight).toBe(12.5);
    expect(typeof result.weight).toBe('number');
  });
});
