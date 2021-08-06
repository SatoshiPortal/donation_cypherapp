import logger from "./Log2File";
import DonationConfig from "../config/DonationConfig";
import { CyphernodeClient } from "./CyphernodeClient";
import { DonationDB } from "./DonationDB";
import {
  ErrorCodes,
  IResponseMessage,
} from "../types/jsonrpc/IResponseMessage";
import { DonationEntity } from "../entity/DonationEntity";
import IReqLnCreateInvoice from "../types/cyphernode/IReqLnCreateInvoice";
import { CreateDonationValidator } from "./validators/CreateDonationValidator";
import IReqCreateDonation from "../types/IReqCreateDonation";
import IRespDonation from "../types/IRespDonation";
import IReqWatch from "../types/cyphernode/IReqWatch";
import IRespWatch from "../types/cyphernode/IRespWatch";
import { randomBytes } from "crypto";

class Donation {
  private _donationConfig: DonationConfig;
  private _cyphernodeClient: CyphernodeClient;
  private _donationDB: DonationDB;

  constructor(donationConfig: DonationConfig) {
    this._donationConfig = donationConfig;
    this._cyphernodeClient = new CyphernodeClient(this._donationConfig);
    this._donationDB = new DonationDB(this._donationConfig);
  }

  configureDonation(donationConfig: DonationConfig): void {
    this._donationConfig = donationConfig;
    this._donationDB.configureDB(this._donationConfig).then(() => {
      this._cyphernodeClient.configureCyphernode(this._donationConfig);
    });
  }

  async createDonation(
    donationReq: IReqCreateDonation
  ): Promise<IRespDonation> {
    logger.info("Donation.createDonation, donationReq:", donationReq);

    const response: IRespDonation = {};

    if (CreateDonationValidator.validateRequest(donationReq)) {
      // Inputs are valid.
      logger.debug("Donation.lnServiceWithdraw, Inputs are valid.");

      // First check if beneficiary is valid

      const beneficiary = await this._donationDB.getBeneficiaryByLabel(
        donationReq.beneficiaryLabel
      );

      if (!beneficiary || !beneficiary.active) {
        response.error = {
          code: ErrorCodes.InvalidParams,
          message: "No such beneficiary!",
        };
      } else {
        let donationEntity = new DonationEntity();

        donationEntity.donationToken = randomBytes(16).toString("hex");

        const callbackUrl =
          this._donationConfig.URL_API_SERVER +
          ":" +
          this._donationConfig.URL_API_PORT +
          this._donationConfig.URL_CTX_WEBHOOKS +
          "/" +
          donationEntity.donationToken;

        // Let's create a ln invoice
        const label: string =
          "donation-" + beneficiary.label + "-" + donationEntity.donationToken;

        const lnCreateInvoiceTO: IReqLnCreateInvoice = {
          label,
          description:
            "Thanks for your donation to " + beneficiary.description + "!",
          callbackUrl,
        };
        const lnResp = await this._cyphernodeClient.lnCreateInvoice(
          lnCreateInvoiceTO
        );

        if (lnResp.result) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          donationEntity.bolt11 = (lnResp.result as any).bolt11;
        }

        // If donation address is fixed in the database, let's return that
        // If xpub is set in the database, let's derive next address
        // Else, let's getnewaddress from cyphernode
        if (beneficiary.bitcoinAddress) {
          donationEntity.bitcoinAddress = beneficiary.bitcoinAddress;
        } else if (beneficiary.xpub) {
          const addresses = await this._cyphernodeClient.derivePubPath({
            pub32: beneficiary.xpub,
            path: beneficiary.path + "/" + ((beneficiary.xpubIndex || 0) + 1),
          });
          if (addresses.result) {
            donationEntity.bitcoinAddress =
              addresses.result?.addresses[0].address;
            beneficiary.xpubIndex = (beneficiary.xpubIndex || 0) + 1;
          }
        } else {
          const btcResp = await this._cyphernodeClient.getNewBitcoinAddress();
          if (btcResp.result) {
            donationEntity.bitcoinAddress = btcResp.result.address;
          }
        }

        // Watch the Bitcoin address
        if (donationEntity.bitcoinAddress) {
          const watchTO: IReqWatch = {
            address: donationEntity.bitcoinAddress,
            unconfirmedCallbackURL: callbackUrl,
            confirmedCallbackURL: callbackUrl,
          };
          const watch: IRespWatch = await this._cyphernodeClient.watch(watchTO);

          // Save cn_watch_id
          donationEntity.cnWatchId = watch.result?.id;
        }

        // Save donation, will generate id
        donationEntity.beneficiary = beneficiary;
        donationEntity = await this._donationDB.saveDonation(donationEntity);

        response.result = {
          donationToken: donationEntity.donationToken,
          bitcoinAddress: donationEntity.bitcoinAddress,
          bitcoinPaymentDetails: donationEntity.bitcoinPaymentDetails || "",
          bitcoinPaidTimestamp: donationEntity.bitcoinPaidTimestamp,
          bitcoinAmount: donationEntity.bitcoinAmount,
          bolt11: donationEntity.bolt11,
          lnPaymentDetails: donationEntity.lnPaymentDetails,
          lnPaidTimestamp: donationEntity.lnPaidTimestamp,
          lnMsatoshi: donationEntity.lnMsatoshi,
          beneficiaryDescription: donationEntity.beneficiary.description || "",
        };
      }
    } else {
      // There is an error with inputs
      logger.debug("Donation.createDonation, there is an error with inputs.");

      response.error = {
        code: ErrorCodes.InvalidRequest,
        message: "Invalid arguments",
      };
    }

    logger.debug("Donation.createDonation, responding:", response);

    return response;
  }

  async getDonation(donationToken: string): Promise<IRespDonation> {
    logger.info("Donation.getDonation, donationToken:", donationToken);

    const response: IRespDonation = {};

    if (donationToken) {
      // Inputs are valid.
      logger.debug("Donation.getDonation, Inputs are valid.");

      const donationEntity = await this._donationDB.getDonationByToken(
        donationToken
      );

      if (donationEntity != null) {
        logger.debug(
          "Donation.getDonation, donationEntity found for this donationToken!"
        );

        const label: string =
          "donation-" +
          donationEntity.beneficiary.label +
          "-" +
          donationEntity.donationToken;

        const lnResp = await this._cyphernodeClient.lnGetInvoice(label);
        let lnInvoiceStatus: string;

        logger.debug("Donation.getDonation, lnResp:", lnResp);

        if (lnResp.result) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          lnInvoiceStatus = (lnResp.result as any).invoices[0].status;
        } else {
          lnInvoiceStatus = "NA";
        }
        logger.debug("Donation.getDonation, lnInvoiceStatus:", lnInvoiceStatus);

        response.result = {
          donationToken: donationEntity.donationToken,
          bitcoinAddress: donationEntity.bitcoinAddress,
          bitcoinPaymentDetails: donationEntity.bitcoinPaymentDetails || "",
          bitcoinPaidTimestamp: donationEntity.bitcoinPaidTimestamp,
          bitcoinAmount: donationEntity.bitcoinAmount,
          bolt11: donationEntity.bolt11,
          lnPaymentDetails: donationEntity.lnPaymentDetails,
          lnPaidTimestamp: donationEntity.lnPaidTimestamp,
          lnMsatoshi: donationEntity.lnMsatoshi,
          beneficiaryDescription: donationEntity.beneficiary.description || "",
        };
      } else {
        // Active Donation not found
        logger.debug("Donation.getDonation, Donation not found.");

        response.error = {
          code: ErrorCodes.InvalidRequest,
          message: "Donation not found",
        };
      }
    } else {
      // There is an error with inputs
      logger.debug("Donation.getDonation, there is an error with inputs.");

      response.error = {
        code: ErrorCodes.InvalidRequest,
        message: "Invalid arguments",
      };
    }

    logger.debug("Donation.getDonation, responding:", response);

    return response;
  }

  async processWebhooks(
    donationToken: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webhookBody: any
  ): Promise<IResponseMessage> {
    logger.info("Donation.processWebhooks:", donationToken, webhookBody);

    const donationEntity = await this._donationDB.getDonationByToken(
      donationToken
    );

    let result;

    if (donationEntity) {
      if (webhookBody.bolt11) {
        // This means the payment was made using LN
        donationEntity.lnPaymentDetails = JSON.stringify(webhookBody);
        donationEntity.lnPaidTimestamp = new Date();
        donationEntity.lnMsatoshi = webhookBody.msatoshi_received;
        // if (donationEntity.cnWatchId) {
        //   this._cyphernodeClient.unwatch(donationEntity.cnWatchId);
        // }
      } else {
        // This means the payment was made on-chain
        donationEntity.bitcoinPaymentDetails = JSON.stringify(webhookBody);
        donationEntity.bitcoinPaidTimestamp = new Date();
        donationEntity.bitcoinAmount = webhookBody.sent_amount;
      }
      this._donationDB.saveDonation(donationEntity);

      result = { id: webhookBody.id } as IResponseMessage;
    } else {
      result = {
        error: {
          code: ErrorCodes.InternalError,
          message: "Donation not found!",
        },
      } as IResponseMessage;
    }

    return result;
  }
}

export { Donation };
