export default interface IDonationPublic {
  donationToken: string;
  bitcoinAddress?: string;
  bolt11?: string;
  lightning?: boolean;
  lnInvoiceStatus?: string;
  paymentDetails?: string;
  amount?: number;
  paidTimestamp?: Date;
  beneficiaryDescription: string;
}
