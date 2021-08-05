export default interface IReqLnCreateInvoice {
  // - msatoshi, optional, amount in milli-satoshi, will be "any" if not supplied
  // - label, required, must be a unique string
  // - description, required, string representing a short description of the invoice
  // - expiry, optional, in seconds
  // - callbackUrl. optional, the URL that will be called when the invoice is paid

  msatoshi?: number;
  label: string;
  description: string;
  expiry?: number;
  callbackUrl?: string;
}
