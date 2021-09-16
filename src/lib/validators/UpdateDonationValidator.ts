import IReqUpdateDonation from "../../types/IReqUpdateDonation";

class UpdateDonationValidator {
  static validateRequest(request: IReqUpdateDonation): boolean {
    if (request.donationToken) {
      // Mandatory donationToken found
      return true;
    }
    return false;
  }
}

export { UpdateDonationValidator };
