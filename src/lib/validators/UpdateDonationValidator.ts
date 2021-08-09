import IReqUpdateDonation from "../../types/IReqUpdateDonation";

class UpdateDonationValidator {
  static validateRequest(request: IReqUpdateDonation): boolean {
    if (request.beneficiaryLabel && request.donationToken) {
      // Mandatory beneficiaryLabel and donationToken found
      return true;
    }
    return false;
  }
}

export { UpdateDonationValidator };
