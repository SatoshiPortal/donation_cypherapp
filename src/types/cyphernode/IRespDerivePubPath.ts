import { IResponseError } from "../jsonrpc/IResponseMessage";
import IDerivePubPath from "./IDerivePubPath";

export default interface IRespDerivePubPath {
  result?: IDerivePubPath;
  error?: IResponseError<never>;
}
