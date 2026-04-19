import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';

interface InvoiceData {
  paymentId: string;
  userId: string;
  memberName: string;
  membershipId: string;
  amount: number;
  currency: string;
  razorpayPaymentId: string;
  description: string;
  date: Date;
}

export async function generateInvoice(data: InvoiceData): Promise<string> {
  const dir = path.join(env.STORAGE_PATH, 'invoices', data.userId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${data.paymentId}.pdf`);
  const relativePath = path.relative('.', filePath);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    doc.fontSize(22).font('Helvetica-Bold').text(env.CLUB_NAME, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(env.CLUB_EMAIL, { align: 'center' });
    doc.moveDown(2);

    // Title
    doc.fontSize(16).font('Helvetica-Bold').text('PAYMENT RECEIPT', { align: 'center' });
    doc.moveDown();

    // Divider
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Details
    const details = [
      ['Receipt No', data.paymentId],
      ['Date', data.date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })],
      ['Member Name', data.memberName],
      ['Membership ID', data.membershipId],
      ['Payment ID', data.razorpayPaymentId],
      ['Description', data.description],
      ['Amount', `₹${(data.amount / 100).toFixed(2)} ${data.currency}`],
    ];

    doc.fontSize(11).font('Helvetica');
    for (const [label, value] of details) {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
      doc.font('Helvetica').text(String(value));
      doc.moveDown(0.5);
    }

    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    doc.fontSize(9).text('This is a computer-generated receipt and does not require a signature.', { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(relativePath));
    stream.on('error', reject);
  });
}
