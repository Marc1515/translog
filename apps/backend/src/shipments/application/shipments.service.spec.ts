import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentStatus } from '../../generated/prisma/client.js';
import { ShipmentsRepository } from '../infrastructure/shipments.repository.js';
import { ShipmentsService } from './shipments.service.js';

describe('ShipmentsService domain rules', () => {
  let service: ShipmentsService;
  const repository = {
    findById: vi.fn(),
    updateStatusWithEvent: vi.fn(),
    cancelWithEvent: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        { provide: ShipmentsRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(ShipmentsService);
  });

  it('rejects invalid transitions with ConflictException', async () => {
    repository.findById.mockResolvedValue({
      id: 'shipment-id',
      status: ShipmentStatus.CREATED,
    });

    await expect(
      service.updateStatus(
        'shipment-id',
        {
          status: ShipmentStatus.IN_TRANSIT,
          location: 'Madrid',
        },
        'user-id',
      ),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(repository.updateStatusWithEvent).not.toHaveBeenCalled();
  });

  it('sets deliveredAt when transitioning to DELIVERED', async () => {
    repository.findById.mockResolvedValue({
      id: 'shipment-id',
      status: ShipmentStatus.OUT_FOR_DELIVERY,
    });
    repository.updateStatusWithEvent.mockResolvedValue({
      id: 'shipment-id',
      trackingCode: 'ENV-20260902-ABCD',
      originAddress: 'Madrid',
      destinationAddress: 'Barcelona',
      recipientName: 'Carlos',
      contactPhone: null,
      weight: 12.5,
      status: ShipmentStatus.DELIVERED,
      deliveredAt: new Date('2026-09-02T10:00:00.000Z'),
      createdAt: new Date('2026-09-02T09:00:00.000Z'),
    });

    const result = await service.updateStatus(
      'shipment-id',
      {
        status: ShipmentStatus.DELIVERED,
        location: 'Barcelona',
      },
      'user-id',
    );

    expect(repository.updateStatusWithEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ShipmentStatus.DELIVERED,
        deliveredAt: expect.any(Date),
      }),
    );
    expect(result.status).toBe(ShipmentStatus.DELIVERED);
    expect(result.deliveredAt).not.toBeNull();
  });

  it('rejects cancellation of DELIVERED shipments', async () => {
    repository.findById.mockResolvedValue({
      id: 'shipment-id',
      status: ShipmentStatus.DELIVERED,
    });

    await expect(service.cancel('shipment-id', 'user-id')).rejects.toBeInstanceOf(
      ConflictException,
    );

    expect(repository.cancelWithEvent).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when shipment does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      service.updateStatus(
        'missing-id',
        {
          status: ShipmentStatus.IN_WAREHOUSE,
          location: 'Madrid',
        },
        'user-id',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
