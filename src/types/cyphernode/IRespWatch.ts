import { IResponseError } from "../jsonrpc/IResponseMessage";
import IWatch from "./IWatch";

export default interface IRespWatch {
  result?: IWatch;
  error?: IResponseError<never>;
}
