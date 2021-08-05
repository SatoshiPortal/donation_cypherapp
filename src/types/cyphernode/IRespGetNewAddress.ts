import { IResponseError } from "../jsonrpc/IResponseMessage";
import IGetNewAddress from "./IGetNewAddress";

export default interface IRespGetNewAddress {
  result?: IGetNewAddress;
  error?: IResponseError<never>;
}
