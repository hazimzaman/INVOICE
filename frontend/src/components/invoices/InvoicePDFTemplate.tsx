import React from 'react';
import { Text, View, StyleSheet, Image, Font, Page } from '@react-pdf/renderer';
import { Invoice } from '@/types/invoice';
import { Settings } from '@/types/settings';
import { formatDate } from '@/utils/dateFormat';
import { supabase } from '@/lib/supabase';

// Register fonts for PDF
Font.register({
  family: 'OpenSans',
  fonts: [
    { src: '/OpenSans-Regular.ttf' },
    { src: '/OpenSans-Bold.ttf', fontWeight: 'bold' }
  ]
});

Font.register({
  family: 'Montserrat',
  fonts: [
    { src: '/Montserrat-Regular.ttf', fontWeight: 'normal' },
    { src: '/Montserrat-Bold.ttf', fontWeight: 'bold' },
    { src: '/OpenSans-Bold.ttf', fontWeight: 'bold' },
    { src: '/OpenSans-Regular.ttf', fontWeight: 'normal' },
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Montserrat',
    fontSize: 10.5,
  },
  invoiceContainer: {
    position: 'relative',
    flexDirection: 'column',
    gap: 25,
  },
  blobWrapper: {
    position: 'absolute',
    width: 200,
    height: 503,
    left: -100,
    zIndex: -1,
    opacity: 0.12,
    top: 67,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 50,
  },
  invoiceTitle: {
    fontFamily: 'OpenSans',
    fontSize: 48.6,
    fontWeight: 'normal',
    letterSpacing: 2,
    marginTop: 30,
    alignSelf: 'center',
    
  },
  companyInfo: {
    textAlign: 'right',
    alignItems: 'flex-end',
    marginBottom:15,
  },
  companyLogo: {
    width: 'auto',
    height: 60,
    marginBottom: 8,
    marginLeft: 'auto',
    objectFit: 'contain',
  },
  companyName: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'OpenSans',
    marginBottom: 4,
  },
  companyDetail: {
    marginBottom: 2,
  },
  contactName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  wise: {
    marginTop: 4,
  },
  invoiceDetails: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  leftDetails: {
    flex: 1,
    flexDirection: 'column',
    rowGap: 2,
    transform: 'translateY(-50px)',
  },
  rightDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    transform: 'translateY(-30px)',
    paddingTop: 35,
  },
  dateContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
    columnGap: 10
  },
  detailLabel: {
    width: 80,
    fontWeight: 'bold',
    marginRight: 8,
  },
  billTo: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 2,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee',
    transform: 'translateY(-50px)',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#fafafa',
    borderBottomWidth: 2,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  tableCell2: {
    flex: 3,
    fontSize: 10,
  },
  tableCellAmount: {
    flex: 1,
    textAlign: 'right',
    fontSize: 10,
  },
  totalSection: {
    textAlign: 'right',
    paddingRight: 8,
    transform: 'translateY(-50px)',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    paddingBottom: 20,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.03,
  },
  dateSection: {
    position: 'absolute',
    top: 40,
    right: 60,
    fontSize: 10,
    color: '#666',
  },
  clientCompanyName: {
    fontWeight: 'bold',
  },
  wiseLabel: {
    fontWeight: 'bold',
  },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },
  logo: {
    width: 'auto',
    height: 50,
    marginBottom: 20,
    objectFit: 'contain'
  },
});

export const InvoicePDF: React.FC<{ invoice: Invoice; businessInfo: Settings }> = ({ invoice, businessInfo }) => {
  const logoUrl = businessInfo?.business_logo || '';

  return (
    <View style={styles.page}>
      <View style={styles.invoiceContainer}>
        <View style={styles.blobWrapper}>
          <Image src="/Frame.png" />
        </View>
        
        <View style={styles.header}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <View style={styles.companyInfo}>
            {logoUrl && (
              <Image
                src={logoUrl}
                style={styles.companyLogo}
                cache={false}
              />
            )}
            <Text style={styles.companyName}>{businessInfo.business_name}</Text>
            <Text style={styles.contactName}>{businessInfo.business_address}</Text>
            <Text style={styles.companyDetail}>{businessInfo.contact_phone}</Text>
            <Text style={styles.companyDetail}>{businessInfo.business_address}</Text>
            {businessInfo.wise_email && (
              <Text style={styles.wise}>
                <Text style={styles.wiseLabel}>WISE: </Text>
                {businessInfo.wise_email}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.invoiceDetails}>
          <View style={styles.leftDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Invoice No:</Text>
              <Text>{invoice.invoice_number} {invoice.client?.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bill to:</Text>
              <View style={styles.billTo}>
                <Text style={styles.clientCompanyName}>{invoice.client?.name}</Text>
                <Text>{invoice.client?.company}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address:</Text>
              <Text>{invoice.client?.address}</Text>
            </View>
            
          </View>

          <View style={styles.rightDetails}>
            <View style={styles.dateContainer}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text> {formatDate(invoice.date)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>#</Text>
            <Text style={styles.tableCell2}>Item</Text>
            <Text style={styles.tableCell}>Price</Text>
            <Text style={styles.tableCellAmount}>Amount</Text>
          </View>
          {(invoice?.items || []).map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{index + 1}.</Text>
              <Text style={styles.tableCell2}>
                <Text style={styles.itemName}>{item?.name}</Text>
                {item?.description && (
                  <Text>{'\n'}{item?.description}</Text>
                )}
              </Text>
              <Text style={styles.tableCell}>
              {invoice.client?.currency || '€'}{item.amount.toFixed(2)}
              </Text>
              <Text style={styles.tableCellAmount}>
              {invoice.client?.currency || '€'}{item.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>
          Total: {invoice.client?.currency || '€'}{invoice.total.toFixed(2)}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>For any questions, please contact: {businessInfo.contact_email}</Text>
        </View>
      </View>
    </View>
  );
}; 







