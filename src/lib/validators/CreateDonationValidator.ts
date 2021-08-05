import IReqCreateDonation from "../../types/IReqCreateDonation";

class CreateDonationValidator {
  static validateRequest(request: IReqCreateDonation): boolean {
    if (request.beneficiaryLabel) {
      // Mandatory beneficiaryLabel found
      return true;
    }
    return false;
  }
}

export { CreateDonationValidator };
