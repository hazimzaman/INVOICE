interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

interface Invoice {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

interface BusinessInfo {
  name: string;
  address: string;
  footerNote?: string;
}

interface Client {
  name: string;
  email: string;
  address: string;
}

export function InvoicePDFTemplate({ 
  invoice, 
  business, 
  client 
}: { 
  invoice: Invoice; 
  business: BusinessInfo; 
  client: Client; 
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.5;
            margin: 0;
            padding: 40px;
          }

          .invoice-header {
            position: relative;
            padding: 40px;
            margin-bottom: 60px;
            background: linear-gradient(135deg, transparent 50%, #f3f4f6 50%);
          }

          .invoice-title {
            font-size: 48px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 40px;
            letter-spacing: 2px;
          }

          .invoice-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .detail-group {
            margin-bottom: 20px;
            gap: 20px;
          }

          .detail-label {
            font-weight: 600;
            color: #4b5563;
            margin-bottom: 4px;
          }

          .detail-value {
            color: #111827;
          }

          .company-details {
            text-align: right;
            position: absolute;
            top: 40px;
            right: 40px;
          }

          .company-details p {
            margin: 4px 0;
            color: #4b5563;
          }

          .wise-info {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 8px;
            width: auto;
          }

          .wise-label {
            font-weight: 600;
            color: #4b5563;
          }

          .client-info {
            margin-bottom: 40px;
          }

          .client-info h3 {
            color: #4b5563;
            font-size: 18px;
            margin: 0 0 10px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }

          th {
            background-color: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #4b5563;
          }

          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }

          .totals {
            width: 300px;
            margin-left: auto;
          }

          .totals tr td:first-child {
            font-weight: 600;
          }

          .totals tr:last-child {
            font-size: 18px;
            font-weight: 700;
            color: #2563eb;
          }

          .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-details">
            <div>
              <div class="detail-group">
                <div class="detail-label">Invoice No:</div>
                <div class="detail-value">${invoice.invoiceNumber}</div>
              </div>
              <div class="detail-group">
                <div class="detail-label">Bill to:</div>
                <div class="detail-value">${client.name}</div>
              </div>
              <div class="detail-group">
                <div class="detail-label">Address:</div>
                <div class="detail-value">${client.address}</div>
              </div>
            </div>
          </div>
          <div class="company-details">
            <p>${business.name}</p>
            <p>${business.address}</p>
            <div class="wise-info">
              <span class="wise-label">WISE:</span>
              <span>${client.email}</span>
            </div>
            <p>Date: ${new Date(invoice.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div class="client-info">
          <h3>Bill To:</h3>
          <p> <span>Client Name  :</span>  ${client.name}</p>
          <p> ${client.email}</p>
          <p> ${client.address}</p>
          
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>$${item.rate.toFixed(2)}</td>
                <td>$${(item.quantity * item.rate).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <table class="totals">
          <tr>
            <td>Subtotal:</td>
            <td>$${invoice.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Tax (${invoice.taxRate}%):</td>
            <td>$${invoice.taxAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Total:</td>
            <td>$${invoice.total.toFixed(2)}</td>
          </tr>
        </table>

        <div class="footer">
          <p>Thank you for your business!</p>
          ${business.footerNote ? `<p>${business.footerNote}</p>` : ''}
        </div>
      </body>
    </html>
  `;
} 