import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import {
  PrismaClient,
  ShipmentStatus,
  UserRole,
} from '../src/generated/prisma/client.js';

const supervisorEmail = process.env.SUPERVISOR_EMAIL;
const supervisorPassword = process.env.SUPERVISOR_PASSWORD;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL es obligatoria para ejecutar el seed.');
}

if (!supervisorEmail || !supervisorPassword) {
  throw new Error(
    'SUPERVISOR_EMAIL y SUPERVISOR_PASSWORD son obligatorias para ejecutar el seed.',
  );
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

type DemoEventDef = {
  status: ShipmentStatus;
  location: string | null;
  notes?: string | null;
  hour: number;
  minute?: number;
};

type DemoShipmentDef = {
  trackingCode: string;
  recipientName: string;
  originAddress: string;
  destinationAddress: string;
  weight: number;
  status: ShipmentStatus;
  events: DemoEventDef[];
};

const demoShipments: DemoShipmentDef[] = [
  {
    trackingCode: 'ENV-20260902-D001',
    recipientName: 'Ana Torres',
    originAddress: 'Demo Origin St 1, Dublin',
    destinationAddress: 'Demo Dest St 12, Cork',
    weight: 15,
    status: ShipmentStatus.CREATED,
    events: [{ status: ShipmentStatus.CREATED, location: null, hour: 9 }],
  },
  {
    trackingCode: 'ENV-20260902-D002',
    recipientName: 'David Murphy',
    originAddress: 'Demo Origin St 2, Dublin',
    destinationAddress: 'Demo Dest St 34, Galway',
    weight: 60,
    status: ShipmentStatus.IN_WAREHOUSE,
    events: [
      { status: ShipmentStatus.CREATED, location: null, hour: 9 },
      {
        status: ShipmentStatus.IN_WAREHOUSE,
        location: 'Dublin Warehouse',
        hour: 10,
      },
    ],
  },
  {
    trackingCode: 'ENV-20260902-D003',
    recipientName: 'Laura Gómez',
    originAddress: 'Demo Origin St 3, Dublin',
    destinationAddress: 'Demo Dest St 56, Limerick',
    weight: 40,
    status: ShipmentStatus.IN_WAREHOUSE,
    events: [
      { status: ShipmentStatus.CREATED, location: null, hour: 9 },
      {
        status: ShipmentStatus.IN_WAREHOUSE,
        location: 'Dublin Warehouse',
        hour: 10,
      },
    ],
  },
  {
    trackingCode: 'ENV-20260902-D004',
    recipientName: 'Michael Byrne',
    originAddress: 'Demo Origin St 4, Dublin',
    destinationAddress: 'Demo Dest St 78, Waterford',
    weight: 35,
    status: ShipmentStatus.IN_TRANSIT,
    events: [
      { status: ShipmentStatus.CREATED, location: null, hour: 9 },
      {
        status: ShipmentStatus.IN_WAREHOUSE,
        location: 'Dublin Warehouse',
        hour: 10,
      },
      {
        status: ShipmentStatus.IN_TRANSIT,
        location: 'Dublin Distribution Route',
        hour: 11,
      },
    ],
  },
  {
    trackingCode: 'ENV-20260902-D005',
    recipientName: 'Sofía Martín',
    originAddress: 'Demo Origin St 5, Dublin',
    destinationAddress: 'Demo Dest St 90, Belfast',
    weight: 20,
    status: ShipmentStatus.OUT_FOR_DELIVERY,
    events: [
      { status: ShipmentStatus.CREATED, location: null, hour: 9 },
      {
        status: ShipmentStatus.IN_WAREHOUSE,
        location: 'Dublin Warehouse',
        hour: 10,
      },
      {
        status: ShipmentStatus.IN_TRANSIT,
        location: 'Dublin Distribution Route',
        hour: 11,
      },
      {
        status: ShipmentStatus.OUT_FOR_DELIVERY,
        location: 'Dublin Delivery Area',
        hour: 12,
      },
    ],
  },
  {
    trackingCode: 'ENV-20260902-D006',
    recipientName: 'Daniel Kelly',
    originAddress: 'Demo Origin St 6, Dublin',
    destinationAddress: 'Demo Dest St 101, Dublin',
    weight: 10,
    status: ShipmentStatus.DELIVERED,
    events: [
      { status: ShipmentStatus.CREATED, location: null, hour: 9 },
      {
        status: ShipmentStatus.IN_WAREHOUSE,
        location: 'Dublin Warehouse',
        hour: 10,
      },
      {
        status: ShipmentStatus.IN_TRANSIT,
        location: 'Dublin Distribution Route',
        hour: 11,
      },
      {
        status: ShipmentStatus.OUT_FOR_DELIVERY,
        location: 'Dublin Delivery Area',
        hour: 12,
      },
      {
        status: ShipmentStatus.DELIVERED,
        location: 'Dublin',
        hour: 13,
      },
    ],
  },
];

function demoTimestamp(hour: number, minute = 0): Date {
  return new Date(Date.UTC(2026, 8, 2, hour, minute, 0));
}

async function seedDemoShipments(supervisorId: string): Promise<void> {
  for (const demo of demoShipments) {
    const existing = await prisma.shipment.findUnique({
      where: { trackingCode: demo.trackingCode },
    });

    if (existing) {
      continue;
    }

    const firstEvent = demo.events[0];
    const lastEvent = demo.events[demo.events.length - 1];
    const deliveredAt =
      demo.status === ShipmentStatus.DELIVERED
        ? demoTimestamp(lastEvent.hour, lastEvent.minute ?? 0)
        : null;

    await prisma.shipment.create({
      data: {
        trackingCode: demo.trackingCode,
        originAddress: demo.originAddress,
        destinationAddress: demo.destinationAddress,
        recipientName: demo.recipientName,
        weight: demo.weight,
        status: demo.status,
        deliveredAt,
        createdById: supervisorId,
        createdAt: demoTimestamp(firstEvent.hour, firstEvent.minute ?? 0),
        events: {
          create: demo.events.map((eventDef) => ({
            status: eventDef.status,
            userId: supervisorId,
            location: eventDef.location,
            notes: eventDef.notes ?? null,
            createdAt: demoTimestamp(eventDef.hour, eventDef.minute ?? 0),
          })),
        },
      },
    });
  }
}

async function main() {
  const passwordHash = await bcrypt.hash(supervisorPassword, 10);

  const supervisor = await prisma.user.upsert({
    where: { email: supervisorEmail },
    update: {
      passwordHash,
      role: UserRole.SUPERVISOR,
    },
    create: {
      email: supervisorEmail,
      passwordHash,
      role: UserRole.SUPERVISOR,
    },
  });

  await seedDemoShipments(supervisor.id);
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
