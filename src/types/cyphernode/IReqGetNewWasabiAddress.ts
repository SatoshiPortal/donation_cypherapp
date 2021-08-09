export default interface IReqGetNewWasabiAddress {
  // - instanceId, optional, id of the instance where the new address will come from
  // - label, optional
  instanceId?: number;
  label?: string;
  amount?: number;
}
