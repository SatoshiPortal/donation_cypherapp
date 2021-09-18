export default interface IReqWatch {
  // - address, required, watched address
  // - unconfirmedCallbackURL, optional
  // - confirmedCallbackURL, optional
  // - eventMessage, optional

  address: string;
  label?: string;
  unconfirmedCallbackURL?: string;
  confirmedCallbackURL?: string;
  eventMessage?: string;
}
