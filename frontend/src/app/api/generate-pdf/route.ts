import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { generateInvoiceHTML } from '@/components/invoices/InvoiceTemplate';

export async function POST(request: NextRequest) {
  try {
    const { invoice, businessInfo } = await request.json();
    
    // Debug log
    console.log('Received logo URL:', businessInfo?.logo);

    let logoBase64 = '';
    if (businessInfo?.logo) {
      try {
        const logoResponse = await fetch(businessInfo.logo);
        if (!logoResponse.ok) throw new Error('Failed to fetch logo');
        
        const logoBuffer = await logoResponse.arrayBuffer();
        const base64 = Buffer.from(logoBuffer).toString('base64');
        const contentType = logoResponse.headers.get('content-type') || 'image/png';
        logoBase64 = `data:${contentType};base64,${base64}`;
        
        // Debug log
        console.log('Converted logo to base64');
      } catch (error) {
        console.error('Error processing logo:', error);
      }
    }

    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Enable request logging
    page.on('console', msg => console.log('Page log:', msg.text()));

    const htmlContent = generateInvoiceHTML({
      invoice,
      businessInfo: {
        ...businessInfo,
        logo: logoBase64 || ''
      }
    });

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for images to load
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise(resolve => {
            img.onload = img.onerror = resolve;
          }))
      );
    });

    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '40px',
        right: '40px',
        bottom: '40px',
        left: '40px'
      },
      printBackground: true
    });

    await browser.close();
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${invoice.invoice_number}.pdf`
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
} 