import {
  newReservationMessage,
  reservationStatusMessage,
} from './telegram-messages';

describe('newReservationMessage', () => {
  it('computes the total as unitPrice * quantity', () => {
    const message = newReservationMessage({
      productName: 'Laptop',
      quantity: 2,
      unitPrice: 300,
      studentName: 'Ada',
      code: 'SOFT-ABCD',
      studentContact: '+998900000000',
      note: null,
    });

    expect(message).toContain('Сумма: 600');
  });

  it('escapes HTML-special characters in free-text fields', () => {
    const message = newReservationMessage({
      productName: 'Laptop <Pro> & Co',
      quantity: 1,
      unitPrice: 100,
      studentName: 'A & B',
      code: 'SOFT-ABCD',
      studentContact: '+998900000000',
      note: '<script>alert(1)</script>',
    });

    expect(message).toContain('Laptop &lt;Pro&gt; &amp; Co');
    expect(message).toContain('A &amp; B');
    expect(message).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(message).not.toContain('<script>');
  });

  it('omits the note line when there is no note', () => {
    const message = newReservationMessage({
      productName: 'Laptop',
      quantity: 1,
      unitPrice: 100,
      studentName: 'Ada',
      code: 'SOFT-ABCD',
      studentContact: '+998900000000',
      note: null,
    });

    expect(message).not.toContain('Заметка');
  });
});

describe('reservationStatusMessage', () => {
  it('includes the transition and reservation id', () => {
    const message = reservationStatusMessage({
      id: 'r1',
      productName: 'Laptop',
      from: 'new',
      to: 'contacted',
    });

    expect(message).toContain('new → contacted');
    expect(message).toContain('ID: r1');
  });
});
