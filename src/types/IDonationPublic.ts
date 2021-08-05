export default interface IDonationPublic {
  donationToken: string;
  bitcoinAddress?: string;
  bolt11?: string;
  lightning?: boolean;
  paymentDetails?: string;
  amount?: number;
  paidTimestamp?: Date;
  beneficiaryDescription: string;
}
