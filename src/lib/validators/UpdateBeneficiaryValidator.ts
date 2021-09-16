import IReqBeneficiary from "../../types/IReqBeneficiary";

class UpdateBeneficiaryValidator {
  static validateRequest(request: IReqBeneficiary): boolean {
    if (request.label || request.beneficiaryId) {
      // Mandatory label or beneficiaryId found
      return true;
    }
    return false;
  }
}

export { UpdateBeneficiaryValidator };
