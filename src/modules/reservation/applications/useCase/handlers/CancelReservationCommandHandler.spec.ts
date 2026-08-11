import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  createPaymentGatewayMock,
  createPaymentRepositoryMock,
  createSamplePayment,
} from '../../../../payment/applications/useCase/payment-test.helpers';
import { PAYMENT_STATUS } from '../../../../payment/contracts';
import { Property } from '../../../../properties/contracts';
import { CANCELLATION_POLICY } from '../../../domain/constants/cancellation-policy.constant';
import { UserNameVO } from '../../../../user/contracts';
import { EmailVO } from '../../../../../shared/valueObject/email.vo';
import { PhoneNumberVO } from '../../../../../shared/valueObject/phone.vo';
import { User } from '../../../../user/contracts';
import type { IUserRepository } from '../../../../user/contracts';
import type { IPropertyRepository } from '../../../../properties/contracts';
import type { IRoomRepository } from '../../../../rooms/contracts';
import { Room } from '../../../../rooms/contracts';
import { RESERVATION_STATUS } from '../../../domain/constants/reservation-status.constant';
import { ComputeCancellationRefundService } from '../../services/compute-cancellation-refund.service';
import { ResolveReservationCancellationPolicyService } from '../../services/resolve-reservation-cancellation-policy.service';
import { CancelReservationCommandHandler } from './CancelReservationCommandHandler';
import { CancelReservationCommand } from '../commands/CancelReservationCommand';
import {
  createReservationRepositoryMock,
  createSampleReservation,
  createSampleReservationItem,
} from '../reservation-test.helpers';

function createHandler(overrides: {
  reservationRepository?: ReturnType<typeof createReservationRepositoryMock>;
  userRepository?: Partial<IUserRepository>;
  paymentRepository?: ReturnType<typeof createPaymentRepositoryMock>;
  roomRepository?: Partial<IRoomRepository>;
  propertyRepository?: Partial<IPropertyRepository>;
}) {
  const paymentGateway = createPaymentGatewayMock();
  const computeCancellationRefund = new ComputeCancellationRefundService();
  const roomRepository = (overrides.roomRepository ?? {
    findById: vi.fn().mockResolvedValue(
      new Room({
        id: 10,
        name: 'Suite',
        slug: 'suite',
        description: 'Desc',
        pricePerNight: 100,
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        beds: 1,
        quantity: 1,
        size: 30,
        status: 'available',
        property: new Property({
          id: 3,
          name: 'Hotel',
          description: 'Desc',
          address: '1 rue',
          city: 'Paris',
          country: 'France',
          latitude: 0,
          longitude: 0,
          checkInTime: '15:00',
          checkOutTime: '11:00',
          ownerId: 1,
          cancellationPolicy: CANCELLATION_POLICY.MODERATE,
        }),
      }),
    ),
  }) as IRoomRepository;
  const propertyRepository = (overrides.propertyRepository ?? {
    findById: vi.fn().mockResolvedValue(
      new Property({
        id: 3,
        name: 'Hotel',
        description: 'Desc',
        address: '1 rue',
        city: 'Paris',
        country: 'France',
        latitude: 0,
        longitude: 0,
        checkInTime: '15:00',
        checkOutTime: '11:00',
        ownerId: 1,
        cancellationPolicy: CANCELLATION_POLICY.MODERATE,
      }),
    ),
    findAllByOwnerId: vi.fn().mockResolvedValue([]),
  }) as IPropertyRepository;
  const resolveCancellationPolicy =
    new ResolveReservationCancellationPolicyService(
      roomRepository,
      propertyRepository,
    );

  return {
    handler: new CancelReservationCommandHandler(
      overrides.reservationRepository ?? createReservationRepositoryMock(),
      (overrides.userRepository ?? {
        findByAuthId: vi.fn(),
      }) as IUserRepository,
      overrides.paymentRepository ??
        createPaymentRepositoryMock({
          findById: vi.fn().mockResolvedValue(
            createSamplePayment({
              id: 1,
              status: PAYMENT_STATUS.SUCCEEDED,
              amount: 20_000,
            }),
          ),
          update: vi.fn().mockImplementation(async (payment) => payment),
        }),
      roomRepository,
      propertyRepository,
      resolveCancellationPolicy,
      computeCancellationRefund,
      paymentGateway,
      {
        enrich: vi.fn().mockImplementation(async (outputs) => outputs),
      } as never,
    ),
    paymentGateway,
  };
}

describe('CancelReservationCommandHandler', () => {
  it('annule une réservation pour son propriétaire avec remboursement', async () => {
    const item = createSampleReservationItem({
      id: 3,
      reservationId: 1,
      roomId: 10,
      checkIn: '2099-09-01',
      checkOut: '2099-09-03',
    });
    const reservation = createSampleReservation({
      id: 1,
      userId: 5,
      items: [item],
      paymentId: 1,
    });
    const repository = createReservationRepositoryMock({
      update: vi.fn().mockImplementation(async (updated) => updated),
      findById: vi.fn().mockResolvedValue(reservation),
    });
    const user = new User(
      new UserNameVO('Jean'),
      new UserNameVO('Dupont'),
      new EmailVO('jean@test.com'),
      new PhoneNumberVO('+33601020304'),
      '',
      5,
    );

    const { handler, paymentGateway } = createHandler({
      reservationRepository: repository,
      userRepository: { findByAuthId: vi.fn().mockResolvedValue(user) },
    });

    const result = await handler.execute(
      new CancelReservationCommand(1, {
        authId: 1,
        canCancelAll: false,
        canCancelHost: false,
      }),
    );

    expect(result.reservation.status).toBe(RESERVATION_STATUS.CANCELLED);
    expect(result.refundAmount).toBe(20_000);
    expect(paymentGateway.createRefund).toHaveBeenCalled();
  });

  it('rejette si la réservation est déjà annulée', async () => {
    const reservation = createSampleReservation({
      id: 1,
      userId: 5,
      status: RESERVATION_STATUS.CANCELLED,
      paymentId: 1,
    });

    const { handler } = createHandler({
      reservationRepository: createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
    });

    await expect(
      handler.execute(
        new CancelReservationCommand(1, {
          authId: 1,
          canCancelAll: false,
          canCancelHost: false,
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refuse l’annulation par un autre utilisateur', async () => {
    const item = createSampleReservationItem({
      id: 3,
      reservationId: 1,
      roomId: 10,
    });
    const reservation = createSampleReservation({
      id: 1,
      userId: 5,
      items: [item],
      paymentId: 1,
    });
    const user = new User(
      new UserNameVO('Alice'),
      new UserNameVO('Martin'),
      new EmailVO('alice@test.com'),
      new PhoneNumberVO('+33601020304'),
      '',
      6,
    );

    const { handler } = createHandler({
      reservationRepository: createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
      userRepository: { findByAuthId: vi.fn().mockResolvedValue(user) },
    });

    await expect(
      handler.execute(
        new CancelReservationCommand(1, {
          authId: 2,
          canCancelAll: false,
          canCancelHost: false,
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
