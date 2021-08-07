import { IResponseError } from "../jsonrpc/IResponseMessage";
import IGetNewWasabiAddress from "./IGetNewWasabiAddress";

export default interface IRespGetNewWasabiAddress {
  result?: IGetNewWasabiAddress;
  error?: IResponseError<never>;
}
