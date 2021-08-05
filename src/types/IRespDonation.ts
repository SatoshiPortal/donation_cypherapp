import { IResponseError } from "./jsonrpc/IResponseMessage";
import IDonationPublic from "./IDonationPublic";

export default interface IRespGetDonation {
  result?: IDonationPublic;
  error?: IResponseError<never>;
}
