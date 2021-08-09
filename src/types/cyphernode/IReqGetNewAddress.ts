export default interface IReqGetNewAddress {
  // - address_type, optional, address type in: legacy, p2sh-segwit or bech32
  // - label, optional, address label imported in Bitcoin Core

  addressType?: string;
  label?: string;
}
