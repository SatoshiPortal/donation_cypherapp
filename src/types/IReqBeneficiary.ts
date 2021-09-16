export default interface IReqCreateBeneficiary {
  beneficiaryId?: number;
  label: string;
  description?: string;
  emailAddress?: string;
  phoneNumber?: string;
  bitcoinAddress?: string;
  xpub?: string;
  path?: string;
  xpubIndex?: number;
  useXpub?: boolean;
  useWasabi?: boolean;
  active?: boolean;
}
