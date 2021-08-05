import { IResponseError } from "../jsonrpc/IResponseMessage";

export default interface IRespLnCreateInvoice {
  result?: unknown;
  error?: IResponseError<never>;
}
