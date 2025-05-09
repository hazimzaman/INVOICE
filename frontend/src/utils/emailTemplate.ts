interface EmailVariables {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  businessName: string;
  items: Array<{
    name: string;
   
    price: number;
    
  }>;
}

export const parseEmailTemplate = (template: string, variables: EmailVariables) => {
  if (!template) {
    // Generate items table HTML
    const itemsTableRows = variables.items?.map(item => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0; color: #1f2937;">${item.name}</td>
        
        <td style="padding: 12px 0; text-align: right; color: #1f2937;">$${item.price.toFixed(2)}</td>
      
      </tr>
    `).join('') || '';

    // Default professional template with items table
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
        <div style="text-align: left; margin-bottom: 30px;">
          <h2 style="color: #2563eb; margin: 10px; font-size: 24px;">${variables.businessName}</h2>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Dear ${variables.clientName},</p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            I hope this email finds you well. Please find attached invoice #${variables.invoiceNumber} for the amount of ${variables.amount}.
          </p>
        </div>

        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af;">Invoice Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Invoice Number:</td>
              <td style="padding: 8px 0; text-align: right;">#${variables.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Amount Due:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">${variables.amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Due Date:</td>
              <td style="padding: 8px 0; text-align: right;">${variables.dueDate}</td>
            </tr>
          </table>

          <h3 style="margin: 20px 0 15px 0; color: #1e40af;">Invoice Items:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 8px 0; text-align: left; color: #64748b;">Item</th>
              
              <th style="padding: 8px 0; text-align: right; color: #64748b;">Price</th>
              
            </tr>
            ${itemsTableRows}
          </table>
        </div>

        <div style="margin-bottom: 30px;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Please don't hesitate to reach out if you have any questions about the invoice.
          </p>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b;">Best regards,</p>
          <p style="margin: 5px 0 0 0; color: #1e40af;">${variables.businessName}</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          <p style="margin: 0;">This is an automated email, please do not reply directly to this message.</p>
        </div>
      </div>
    `;
  }

  // Replace variables in custom template
  const replacements = {
    '{clientName}': variables.clientName,
    '{invoiceNumber}': variables.invoiceNumber,
    '{amount}': variables.amount,
    '{dueDate}': variables.dueDate,
    '{businessName}': variables.businessName,
    '{{client_name}}': variables.clientName,
    '{{invoice_number}}': variables.invoiceNumber,
    '{{total_amount}}': variables.amount,
    '{{due_date}}': variables.dueDate,
    '{{business_name}}': variables.businessName,
    '{{contact_email}}': variables.businessName,
    // Add items table replacement if needed in custom template
    '{{items_table}}': variables.items?.map(item => `
      <tr>
        <td>${item.name}</td>
        
        <td style="text-align: right;">$${item.price.toFixed(2)}</td>
        
      </tr>
    `).join('') || ''
  };

  return Object.entries(replacements).reduce((text, [key, value]) => {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    return text.replace(regex, value);
  }, template);
}; 