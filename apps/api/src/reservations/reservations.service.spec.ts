import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Reservation } from '../entities/reservation.entity';
import { ReservationsService } from './reservations.service';

function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
  return {
    id: 'r1',
    codeId: 'c1',
    studentName: 'Ada',
    studentContact: '+998900000000',
    productId: 'p1',
    productName: 'Laptop',
    unitPrice: 679,
    quantity: 2,
    status: 'new',
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('ReservationsService', () => {
  let service: ReservationsService;
  let reservations: { findOne: jest.Mock; save: jest.Mock; create: jest.Mock };
  let studentCodes: {
    findActiveByCode: jest.Mock;
    recordUse: jest.Mock;
    findCodeStrings: jest.Mock;
  };
  let products: { findOne: jest.Mock; decrementStock: jest.Mock };
  let telegram: { notify: jest.Mock };

  beforeEach(() => {
    reservations = {
      findOne: jest.fn(),
      save: jest.fn((r) => Promise.resolve(r)),
      create: jest.fn((r) => r as Reservation),
    };
    studentCodes = {
      findActiveByCode: jest.fn(),
      recordUse: jest.fn(() => Promise.resolve(undefined)),
      findCodeStrings: jest.fn(() => Promise.resolve({ c1: 'SOFT-ABCD' })),
    };
    products = {
      findOne: jest.fn(),
      decrementStock: jest.fn(() => Promise.resolve(undefined)),
    };
    telegram = { notify: jest.fn(() => Promise.resolve(undefined)) };

    service = new ReservationsService(
      reservations as never,
      studentCodes as never,
      products as never,
      telegram as never,
    );
  });

  describe('create', () => {
    it('rejects an invalid or disabled code', async () => {
      studentCodes.findActiveByCode.mockResolvedValue(null);

      await expect(
        service.create({
          code: 'BAD',
          productId: 'p1',
          studentContact: '+998900000000',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects an out-of-stock product', async () => {
      studentCodes.findActiveByCode.mockResolvedValue({
        id: 'c1',
        studentName: 'Ada',
        discountOverride: null,
      });
      products.findOne.mockResolvedValue({
        id: 'p1',
        name: 'Laptop',
        price: 799,
        memberDiscount: 15,
        stock: 0,
      });

      await expect(
        service.create({
          code: 'SOFT-ABCD',
          productId: 'p1',
          studentContact: '+998900000000',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('snapshots product name + member price and records a code use', async () => {
      studentCodes.findActiveByCode.mockResolvedValue({
        id: 'c1',
        studentName: 'Ada',
        discountOverride: 25,
      });
      products.findOne.mockResolvedValue({
        id: 'p1',
        name: 'Laptop',
        price: 800,
        memberDiscount: 15,
        stock: 3,
      });

      const result = await service.create({
        code: 'SOFT-ABCD',
        productId: 'p1',
        studentContact: '+998900000000',
        quantity: 2,
      });

      expect(result.productName).toBe('Laptop');
      expect(result.unitPrice).toBe(600); // 800 * (1 - 25/100)
      expect(result.quantity).toBe(2);
      expect(result.status).toBe('new');
      expect(result.code).toBe('SOFT-ABCD');
      expect(studentCodes.recordUse).toHaveBeenCalledWith('c1');
      expect(telegram.notify).toHaveBeenCalledTimes(1);
      expect(telegram.notify.mock.calls[0][0]).toContain('Laptop');
    });

    it('reserves at the regular price with no code, and never looks one up', async () => {
      products.findOne.mockResolvedValue({
        id: 'p1',
        name: 'Laptop',
        price: 800,
        memberDiscount: 15,
        stock: 3,
      });

      const result = await service.create({
        productId: 'p1',
        studentName: 'Bo',
        studentContact: '+998900000000',
      });

      expect(result.unitPrice).toBe(800);
      expect(result.codeId).toBeNull();
      expect(result.code).toBe('Без кода');
      expect(studentCodes.findActiveByCode).not.toHaveBeenCalled();
      expect(studentCodes.recordUse).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('throws if the reservation does not exist', async () => {
      reservations.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus('missing', { status: 'contacted' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('allows new → contacted without touching stock', async () => {
      reservations.findOne.mockResolvedValue(
        makeReservation({ status: 'new' }),
      );

      const result = await service.updateStatus('r1', { status: 'contacted' });

      expect(result.status).toBe('contacted');
      expect(products.decrementStock).not.toHaveBeenCalled();
      expect(telegram.notify).toHaveBeenCalledTimes(1);
      expect(telegram.notify.mock.calls[0][0]).toContain('new');
      expect(telegram.notify.mock.calls[0][0]).toContain('contacted');
    });

    it('decrements stock by the reserved quantity on contacted → completed', async () => {
      reservations.findOne.mockResolvedValue(
        makeReservation({ status: 'contacted', productId: 'p1', quantity: 2 }),
      );

      const result = await service.updateStatus('r1', { status: 'completed' });

      expect(result.status).toBe('completed');
      expect(products.decrementStock).toHaveBeenCalledWith('p1', 2);
    });

    it('skips the stock decrement if the product was deleted', async () => {
      reservations.findOne.mockResolvedValue(
        makeReservation({ status: 'contacted', productId: null }),
      );

      await service.updateStatus('r1', { status: 'completed' });

      expect(products.decrementStock).not.toHaveBeenCalled();
    });

    it('rejects skipping straight from new to completed', async () => {
      reservations.findOne.mockResolvedValue(
        makeReservation({ status: 'new' }),
      );

      await expect(
        service.updateStatus('r1', { status: 'completed' }),
      ).rejects.toThrow(BadRequestException);
      expect(products.decrementStock).not.toHaveBeenCalled();
      expect(telegram.notify).not.toHaveBeenCalled();
    });

    it('rejects re-completing an already-completed reservation (idempotency guard)', async () => {
      reservations.findOne.mockResolvedValue(
        makeReservation({ status: 'completed' }),
      );

      await expect(
        service.updateStatus('r1', { status: 'completed' }),
      ).rejects.toThrow(BadRequestException);
      expect(products.decrementStock).not.toHaveBeenCalled();
    });

    it('allows cancelling from new or contacted, never from completed', async () => {
      reservations.findOne.mockResolvedValue(
        makeReservation({ status: 'new' }),
      );
      await expect(
        service.updateStatus('r1', { status: 'cancelled' }),
      ).resolves.toMatchObject({ status: 'cancelled' });

      reservations.findOne.mockResolvedValue(
        makeReservation({ status: 'completed' }),
      );
      await expect(
        service.updateStatus('r1', { status: 'cancelled' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
