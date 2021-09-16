export default interface IDonationPublic {
  label: string;
  description?: string;
  emailAddress?: string;
  phoneNumber?: string;
  bitcoinAddress?: string;
  active?: boolean;
}
