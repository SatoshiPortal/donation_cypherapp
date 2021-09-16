import IReqBeneficiary from "../../types/IReqBeneficiary";

class CreateBeneficiaryValidator {
  static validateRequest(request: IReqBeneficiary): boolean {
    if (request.label) {
      // Mandatory beneficiaryLabel found
      return true;
    }
    return false;
  }
}

export { CreateBeneficiaryValidator };
