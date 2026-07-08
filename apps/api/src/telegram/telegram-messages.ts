import { Reservation } from '../entities/reservation.entity';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function newReservationMessage(params: {
  productName: string;
  quantity: number;
  unitPrice: number;
  studentName: string | null;
  code: string;
  studentContact: string;
  note: string | null;
}): string {
  const total = params.unitPrice * params.quantity;
  const lines = [
    '🆕 <b>Новая бронь</b>',
    `Товар: ${escapeHtml(params.productName)} × ${params.quantity}`,
    `Сумма: ${total}`,
    `Студент: ${escapeHtml(params.studentName ?? '—')} (${escapeHtml(params.code)})`,
    `Контакт: ${escapeHtml(params.studentContact)}`,
  ];
  if (params.note) {
    lines.push(`Заметка: ${escapeHtml(params.note)}`);
  }
  return lines.join('\n');
}

export function reservationStatusMessage(params: {
  id: string;
  productName: string;
  from: Reservation['status'];
  to: Reservation['status'];
}): string {
  return [
    '🔄 <b>Статус брони изменён</b>',
    `Товар: ${escapeHtml(params.productName)}`,
    `${params.from} → ${params.to}`,
    `ID: ${params.id}`,
  ].join('\n');
}
