export default interface IDonationPublic {
  donationToken: string;
  bitcoinAddress?: string;
  bitcoinPaymentDetails?: string;
  bitcoinAmount?: number;
  bitcoinPaidTimestamp?: Date;
  bolt11?: string;
  lnInvoiceStatus?: string;
  lnPaymentDetails?: string;
  lnMsatoshi?: number;
  lnPaidTimestamp?: Date;
  beneficiaryDescription: string;
}
