import {
  clampDiscount,
  effectiveDiscount,
  memberPrice,
  saving,
  stockLabel,
} from './pricing';

describe('pricing', () => {
  describe('clampDiscount', () => {
    it('keeps values within 0–90 and rounds', () => {
      expect(clampDiscount(15)).toBe(15);
      expect(clampDiscount(-5)).toBe(0);
      expect(clampDiscount(120)).toBe(90);
      expect(clampDiscount(14.6)).toBe(15);
      expect(clampDiscount(NaN)).toBe(0);
    });
  });

  describe('effectiveDiscount', () => {
    const product = { price: 1000, memberDiscount: 15 };

    it('uses the product discount when there is no code', () => {
      expect(effectiveDiscount(product, null)).toBe(15);
    });

    it('uses the product discount when the code has no bonus', () => {
      expect(effectiveDiscount(product, { extraDiscount: null })).toBe(15);
    });

    it('adds the code bonus on top of the product discount', () => {
      // 10% own + 5% code = 15%
      expect(
        effectiveDiscount({ price: 1000, memberDiscount: 10 }, { extraDiscount: 5 }),
      ).toBe(15);
    });

    it('treats a bonus of 0 as no extra (not "unset")', () => {
      expect(effectiveDiscount(product, { extraDiscount: 0 })).toBe(15);
    });

    it('clamps the combined discount at 90', () => {
      expect(effectiveDiscount(product, { extraDiscount: 200 })).toBe(90);
    });
  });

  describe('memberPrice', () => {
    it('rounds to a whole unit', () => {
      // 799 * 0.85 = 679.15 → 679
      expect(memberPrice({ price: 799, memberDiscount: 15 }, null)).toBe(679);
    });

    it('equals the regular price with a 0% discount', () => {
      expect(memberPrice({ price: 500, memberDiscount: 0 }, null)).toBe(500);
    });

    it('never goes below the 90% clamp', () => {
      // max 90% off → at least 10% of price
      expect(memberPrice({ price: 1000, memberDiscount: 99 }, null)).toBe(100);
    });
  });

  describe('saving', () => {
    it('is regular minus member price', () => {
      expect(saving({ price: 799, memberDiscount: 15 }, null)).toBe(120);
    });

    it('is 0 when there is no discount', () => {
      expect(saving({ price: 500, memberDiscount: 0 }, null)).toBe(0);
    });
  });

  describe('stockLabel', () => {
    it('flags out of stock at 0 or below', () => {
      expect(stockLabel(0)).toBe('Нет в наличии');
      expect(stockLabel(-2)).toBe('Нет в наличии');
    });

    it('warns on low stock (1–3)', () => {
      expect(stockLabel(1)).toBe('Осталось 1');
      expect(stockLabel(3)).toBe('Осталось 3');
    });

    it('shows no badge when there is plenty', () => {
      expect(stockLabel(4)).toBeNull();
      expect(stockLabel(50)).toBeNull();
    });
  });
});
