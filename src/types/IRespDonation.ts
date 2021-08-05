import { IResponseError } from "./jsonrpc/IResponseMessage";
import { DonationEntity } from "../entity/DonationEntity";

export default interface IRespGetDonation {
  result?: DonationEntity;
  error?: IResponseError<never>;
}
