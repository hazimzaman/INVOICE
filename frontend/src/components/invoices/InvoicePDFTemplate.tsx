import { Invoice } from '@/types/invoice';
import { formatDate } from '@/utils/dateFormat';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateInvoicePDF(invoice: Invoice) {
  if (!invoice.client) {
    throw new Error('Client data is required');
  }

  if (!invoice.settings) {
    throw new Error('Settings data is required');
  }

  // Create PDF with high DPI settings
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size at 72 DPI
  
  // Set PDF metadata and properties
  pdfDoc.setTitle(`Invoice-${invoice.invoice_number}`);
  pdfDoc.setAuthor(invoice.settings.business_name);
  pdfDoc.setProducer('Invoice System');
  pdfDoc.setCreator('Invoice Generator');

  // For images, we'll use 300 DPI for high quality
  const IMAGE_DPI = 300;
  const PDF_DPI = 72; // Default PDF DPI
  const dpiScale = IMAGE_DPI / PDF_DPI;

  const { width, height } = page.getSize();
  
  // Load fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Constants for positioning
  const margin = 50;
  const pageTop = height - 150;
  const rightColumnX = width - margin - 250;
  const columnSpacing = 150; // Spacing between table columns

  // INVOICE heading
  page.drawText('INVOICE', {
    x: margin,
    y: pageTop,
    size: 60,
    font: helveticaBold,
    color: rgb(0, 0, 0)
  });

  // Business details on right with proper spacing
  let businessY = pageTop;

  // Logo
  if (invoice.settings.business_logo) {
    try {
      const logoResponse = await fetch(invoice.settings.business_logo);
      const logoArrayBuffer = await logoResponse.arrayBuffer();
      
      let logoImage;
      if (invoice.settings.business_logo.endsWith('.png')) {
        logoImage = await pdfDoc.embedPng(logoArrayBuffer);
      } else if (invoice.settings.business_logo.endsWith('.jpg') || invoice.settings.business_logo.endsWith('.jpeg')) {
        logoImage = await pdfDoc.embedJpg(logoArrayBuffer);
      }

      if (logoImage) {
        const logoSize = 100;
        const logoX = width - margin - logoSize;
        const logoY = pageTop - 20; // Adjusted to align with top

        // Draw circular clipping path
        page.drawCircle({
          x: logoX + (logoSize / 2),
          y: logoY + (logoSize / 2),
          size: logoSize / 2,
          color: rgb(1, 1, 1)
        });

        // Draw the logo at high DPI
        page.drawImage(logoImage, {
          x: logoX,
          y: logoY,
          width: logoSize,
          height: logoSize,
          opacity: 1
        });
      }
    } catch (error) {
      console.error('Error loading logo:', error);
    }
  }

  // Business details with proper formatting
  businessY = pageTop - 140; // Start below logo
  const businessDetails = [
    { label: 'Business Name: ', value: invoice.settings.business_name },
    { label: 'Contact Name: ', value: invoice.settings.contact_name },
    { label: 'Phone: ', value: invoice.settings.contact_phone },
    { label: 'Address: ', value: invoice.settings.business_address },
    { label: 'WISE: ', value: invoice.settings.wise_email }
  ];

  businessDetails.forEach((detail, index) => {
    const y = businessY - (index * 25);
    
    // Label in bold
    page.drawText(detail.label, {
      x: rightColumnX,
      y,
      size: 16,
      font: helveticaBold
    });
    
    // Value in regular font
    page.drawText(detail.value, {
      x: rightColumnX + 120, // Adjusted for proper spacing after label
      y,
      size: 16,
      font: helvetica
    });
  });

  // Client section with proper spacing
  const clientY = pageTop - 200;

  // Invoice details on left
  page.drawText('Invoice No:', {
    x: margin,
    y: clientY,
    size: 14,
    font: helveticaBold
  });

  page.drawText(invoice.invoice_number, {
    x: margin + 100,
    y: clientY,
    size: 14,
    font: helvetica
  });

  // Bill to section
  page.drawText('Bill to:', {
    x: margin,
    y: clientY - 40,
    size: 14,
    font: helveticaBold
  });

  // Client name and details
  page.drawText(invoice.client.name, {
    x: margin,
    y: clientY - 60,
    size: 14,
    font: helvetica
  });

  if (invoice.client.address) {
    page.drawText('Address:', {
      x: margin,
      y: clientY - 90,
      size: 14,
      font: helveticaBold
    });
    
    page.drawText(invoice.client.address, {
      x: margin,
      y: clientY - 110,
      size: 14,
      font: helvetica
    });
  }

  // Due Date
  let leftY = clientY - 25;
  page.drawText('Due Date:', {
    x: margin,
    y: leftY,
    size: 12,
    font: helveticaBold,
    color: rgb(0.4, 0.4, 0.4)
  });

  leftY -= 20;
  page.drawText(formatDate(invoice.due_date), {
    x: margin,
    y: leftY,
    size: 12,
    font: helvetica
  });

  // Start items table after the header
  const tableTop = clientY - 150;
  const tableLeft = margin;
  const tableRight = width - margin;

  // Table Headers
  const tableHeaders = ['#', 'Item', 'Price', 'Amount'];
  
  // Draw table headers
  tableHeaders.forEach((header, index) => {
    page.drawText(header, {
      x: tableLeft + (index * columnSpacing),
      y: tableTop,
      size: 12,
      font: helveticaBold
    });
  });

  // Draw header separator line
  page.drawLine({
    start: { x: tableLeft, y: tableTop - 10 },
    end: { x: tableRight, y: tableTop - 10 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9)
  });

  // Table Rows
  let currentY = tableTop - 40;
  invoice.items?.forEach((item, index) => {
    // Index number
    page.drawText(`${index + 1}.`, {
      x: tableLeft,
      y: currentY,
      size: 12,
      font: helvetica
    });

    // Item name and description
    page.drawText(item.name, {
      x: tableLeft + columnSpacing,
      y: currentY,
      size: 12,
      font: helvetica
    });

    if (item.description) {
      currentY -= 20;
      page.drawText(item.description, {
        x: tableLeft + columnSpacing,
        y: currentY,
        size: 10,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5)
      });
    }

    // Price
    const priceText = `${invoice.client?.currency || '€'}${item.amount.toFixed(2)}`;
    page.drawText(priceText, {
      x: tableLeft + (columnSpacing * 2.5),
      y: currentY + (item.description ? 20 : 0),
      size: 12,
      font: helvetica
    });

    // Amount (same as price for single items)
    page.drawText(priceText, {
      x: tableRight - 80,
      y: currentY + (item.description ? 20 : 0),
      size: 12,
      font: helvetica
    });

    currentY -= item.description ? 40 : 30;
  });

  // Total section
  currentY -= 20;
  page.drawLine({
    start: { x: tableLeft + (columnSpacing * 2), y: currentY },
    end: { x: tableRight, y: currentY },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9)
  });

  currentY -= 30;
  page.drawText('Total', {
    x: tableLeft + (columnSpacing * 2),
    y: currentY,
    size: 14,
    font: helveticaBold
  });

  page.drawText(`${invoice.client?.currency || '€'}${invoice.total.toFixed(2)}`, {
    x: tableRight - 80,
    y: currentY,
    size: 14,
    font: helveticaBold
  });

  // Set PDF compression and quality options
  const pdfBytes = await pdfDoc.save({
    useObjectStreams: false,
    addDefaultPage: false
  });

  return pdfBytes;
} 