import { BeneficiaryEntity } from "../entity/BeneficiaryEntity";
import { IResponseError } from "./jsonrpc/IResponseMessage";

export default interface IRespBeneficiary {
  result?: BeneficiaryEntity;
  error?: IResponseError<never>;
}
