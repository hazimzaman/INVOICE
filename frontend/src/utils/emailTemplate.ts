interface EmailVariables {
  clientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  businessName: string;
}

export const parseEmailTemplate = (template: string, variables: EmailVariables) => {
  return template
    .replace(/{clientName}/g, variables.clientName)
    .replace(/{invoiceNumber}/g, variables.invoiceNumber)
    .replace(/{amount}/g, variables.amount)
    .replace(/{dueDate}/g, variables.dueDate)
    .replace(/{businessName}/g, variables.businessName);
}; 