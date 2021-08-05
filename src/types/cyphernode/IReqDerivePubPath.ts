export default interface IReqDerivePubPath {
  // - pub32, required, xpub/ypub/zpub/tpub/upub/vpub used to derive address(es)
  // - path, required, derivation path including the index, in the form n or n-m (ex.: 0/44'/86 or 0/44'/62-77)

  pub32: string;
  path: string;
}
