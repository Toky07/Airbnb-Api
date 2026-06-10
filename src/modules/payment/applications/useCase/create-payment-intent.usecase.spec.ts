import { describe, expect, it, vi } from 'vitest';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CalculateStayAmountService } from '../../../../shared/pricing/calculate-stay-amount.service';
import { Property } from '../../../properties/domain/entities/property.entity';
import { Room } from '../../../rooms/domain/entities/room.entity';
import type { IRoomRepository } from '../../../rooms/domain/repositories/room.repository';
import {
  createReservationRepositoryMock,
  createSampleReservation,
} from '../../../reservation/applications/useCase/reservation-test.helpers';
import type { IReservationRepository } from '../../../reservation/domain/repositories/reservation.repository';
import { User } from '../../../user/domain/entities/user.entity';
import { UserNameVO } from '../../../user/domain/valueObject/username.vo';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { PAYMENT_STATUS } from '../../domain/constants/payment-status.constant';
import { CreatePaymentIntentUseCase } from './create-payment-intent.usecase';
import {
  createPaymentGatewayMock,
  createPaymentRepositoryMock,
} from './payment-test.helpers';

describe('CreatePaymentIntentUseCase', () => {
  const room = new Room({
    id: 10,
    name: 'Suite',
    description: 'Grande suite',
    pricePerNight: 120,
    maxGuests: 4,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    quantity: 1,
    size: 35,
    status: 'available',
    property: new Property({
      name: 'Hotel',
      description: 'Desc',
      address: '1 rue Test',
      city: 'Paris',
      country: 'France',
      latitude: 0,
      longitude: 0,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      ownerId: 1,
    }),
  });

  const user = new User(
    new UserNameVO('Jean'),
    new UserNameVO('Dupont'),
    new EmailVO('jean@test.com'),
    new PhoneNumberVO('+33601020304'),
    '',
    5,
  );

  it('crée un payment intent Stripe et persiste le paiement', async () => {
    process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

    const paymentRepository = createPaymentRepositoryMock();
    const paymentGateway = createPaymentGatewayMock();
    const roomRepository = {
      findById: vi.fn().mockResolvedValue(room),
    } as unknown as IRoomRepository;
    const userRepository = {
      findByAuthId: vi.fn().mockResolvedValue(user),
    } as unknown as IUserRepository;
    const reservationRepository = createReservationRepositoryMock();

    const useCase = new CreatePaymentIntentUseCase(
      paymentRepository,
      paymentGateway,
      roomRepository,
      userRepository,
      reservationRepository,
      new CalculateStayAmountService(),
    );

    const result = await useCase.execute(5, {
      roomId: 10,
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      guestCount: 2,
    });

    expect(result.paymentId).toBe(1);
    expect(result.clientSecret).toBe('pi_test_123_secret');
    expect(result.amount).toBe(24000);
    expect(result.nights).toBe(2);
    expect(paymentGateway.createPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 24000,
        metadata: expect.objectContaining({
          roomId: '10',
          userId: '5',
        }),
      }),
    );
    expect(paymentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: PAYMENT_STATUS.PENDING,
        transactionId: 'pi_test_123',
      }),
    );
  });

  it('crée un payment intent à partir d’une réservation', async () => {
    process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

    const reservation = createSampleReservation({
      id: 8,
      userId: 5,
      roomId: 10,
      totalPrice: 240,
    });

    const paymentRepository = createPaymentRepositoryMock();
    const paymentGateway = createPaymentGatewayMock();
    const useCase = new CreatePaymentIntentUseCase(
      paymentRepository,
      paymentGateway,
      { findById: vi.fn().mockResolvedValue(room) } as unknown as IRoomRepository,
      { findByAuthId: vi.fn().mockResolvedValue(user) } as unknown as IUserRepository,
      createReservationRepositoryMock({
        findById: vi.fn().mockResolvedValue(reservation),
      }),
      new CalculateStayAmountService(),
    );

    const result = await useCase.execute(5, { reservationId: 8 });

    expect(result.amount).toBe(24000);
    expect(paymentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        reservationId: 8,
      }),
    );
  });

  it('lève une erreur si l’utilisateur est introuvable', async () => {
    const useCase = new CreatePaymentIntentUseCase(
      createPaymentRepositoryMock(),
      createPaymentGatewayMock(),
      { findById: vi.fn() } as unknown as IRoomRepository,
      { findByAuthId: vi.fn().mockResolvedValue(null) } as unknown as IUserRepository,
      createReservationRepositoryMock(),
      new CalculateStayAmountService(),
    );

    await expect(
      useCase.execute(1, {
        roomId: 10,
        checkIn: '2026-07-01',
        checkOut: '2026-07-03',
        guestCount: 2,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('lève une erreur si la chambre est introuvable', async () => {
    const useCase = new CreatePaymentIntentUseCase(
      createPaymentRepositoryMock(),
      createPaymentGatewayMock(),
      { findById: vi.fn().mockResolvedValue(null) } as unknown as IRoomRepository,
      { findByAuthId: vi.fn().mockResolvedValue(user) } as unknown as IUserRepository,
      createReservationRepositoryMock(),
      new CalculateStayAmountService(),
    );

    await expect(
      useCase.execute(5, {
        roomId: 99,
        checkIn: '2026-07-01',
        checkOut: '2026-07-03',
        guestCount: 2,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejette un nombre de voyageurs supérieur à la capacité', async () => {
    const useCase = new CreatePaymentIntentUseCase(
      createPaymentRepositoryMock(),
      createPaymentGatewayMock(),
      { findById: vi.fn().mockResolvedValue(room) } as unknown as IRoomRepository,
      { findByAuthId: vi.fn().mockResolvedValue(user) } as unknown as IUserRepository,
      createReservationRepositoryMock(),
      new CalculateStayAmountService(),
    );

    await expect(
      useCase.execute(5, {
        roomId: 10,
        checkIn: '2026-07-01',
        checkOut: '2026-07-03',
        guestCount: 10,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
