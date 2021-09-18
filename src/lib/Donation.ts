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
import IReqUpdateDonation from "../types/IReqUpdateDonation";
import { UpdateDonationValidator } from "./validators/UpdateDonationValidator";
import IReqBeneficiary from "../types/IReqBeneficiary";
import IRespBeneficiary from "../types/IRespBeneficiary";
import { CreateBeneficiaryValidator } from "./validators/CreateBeneficiaryValidator";
import { BeneficiaryEntity } from "../entity/BeneficiaryEntity";
import { UpdateBeneficiaryValidator } from "./validators/UpdateBeneficiaryValidator";

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
      logger.debug("Donation.createDonation, Inputs are valid.");

      // First check if beneficiary is valid

      const beneficiary = await this._donationDB.getBeneficiaryByLabel(
        donationReq.beneficiaryLabel
      );

      // logger.debug("Donation.createDonation, beneficiary:", beneficiary);

      if (!beneficiary || !beneficiary.active) {
        response.error = {
          code: ErrorCodes.InvalidParams,
          message: "No such beneficiary!",
        };
      } else {
        let donationEntity = new DonationEntity();
        donationEntity.beneficiary = beneficiary;

        donationEntity.donationToken = randomBytes(16).toString("hex");

        const callbackUrl =
          this._donationConfig.URL_API_SERVER +
          ":" +
          this._donationConfig.URL_API_PORT +
          this._donationConfig.URL_CTX_WEBHOOKS +
          "/" +
          donationEntity.donationToken;

        let lnInvoiceStatus = null;
        let bolt11 = null;

        if (donationReq.lnMsatoshi) {
          // If lnMsatoshi supplied, let's create a ln invoice

          donationEntity.lnMsatoshi = donationReq.lnMsatoshi;

          ({ bolt11, lnInvoiceStatus } = await this.createLnInvoice(
            donationEntity,
            callbackUrl
          ));
          donationEntity.bolt11 = bolt11;
        }

        // If use_xpub is true and xpub is set in the database, let's derive next address
        // If not or xpub derivation didn't work, if donation address is fixed in the database, let's return that
        // If no fixed address in database, let's getnewaddress from cyphernode
        if (beneficiary.useXpub && beneficiary.xpub) {
          const addresses = await this._cyphernodeClient.derivePubPath({
            pub32: beneficiary.xpub,
            path: beneficiary.path + "/" + ((beneficiary.xpubIndex || 0) + 1),
          });
          if (addresses.result) {
            donationEntity.bitcoinAddress =
              addresses.result?.addresses[0].address;
            beneficiary.xpubIndex = (beneficiary.xpubIndex || 0) + 1;
          }
        }
        if (!donationEntity.bitcoinAddress) {
          if (beneficiary.bitcoinAddress) {
            donationEntity.bitcoinAddress = beneficiary.bitcoinAddress;
          } else if (beneficiary.useWasabi) {
            const btcResp = await this._cyphernodeClient.getNewWasabiAddress({
              label:
                "donation-" +
                beneficiary.label +
                "-" +
                donationEntity.donationToken,
              amount: 0.0001,
            });
            if (btcResp.result) {
              donationEntity.bitcoinAddress = btcResp.result.address;
            }
          } else {
            const btcResp = await this._cyphernodeClient.getNewBitcoinAddress({
              label:
                "donation-" +
                beneficiary.label +
                "-" +
                donationEntity.donationToken,
            });
            if (btcResp.result) {
              donationEntity.bitcoinAddress = btcResp.result.address;
            }
          }
        }

        // Watch the Bitcoin address
        if (donationEntity.bitcoinAddress) {
          const watchTO: IReqWatch = {
            address: donationEntity.bitcoinAddress,
            label:
              "donation-" +
              beneficiary.label +
              "-" +
              donationEntity.donationToken,
            unconfirmedCallbackURL: callbackUrl,
            confirmedCallbackURL: callbackUrl,
          };
          const watch: IRespWatch = await this._cyphernodeClient.watch(watchTO);

          // Save cn_watch_id
          donationEntity.cnWatchId = watch.result?.id;
        }

        // Save donation, will generate id
        donationEntity = await this._donationDB.saveDonation(donationEntity);

        response.result = {
          donationToken: donationEntity.donationToken,
          bitcoinAddress: donationEntity.bitcoinAddress,
          bitcoinAmount: donationEntity.bitcoinAmount,
          bolt11: donationEntity.bolt11,
          lnInvoiceStatus,
          lnMsatoshi: donationEntity.lnMsatoshi,
          beneficiaryDescription: donationEntity.beneficiary.description,
        };
        if (donationEntity.lnPaidTimestamp) {
          response.result = Object.assign(response.result, {
            lnPaidTimestamp: new Date(donationEntity.lnPaidTimestamp),
            lnPaymentDetails: donationEntity.lnPaymentDetails
              ? JSON.parse(donationEntity.lnPaymentDetails)
              : null,
          });
        }
        if (donationEntity.bitcoinPaidTimestamp) {
          response.result = Object.assign(response.result, {
            bitcoinPaidTimestamp: new Date(donationEntity.bitcoinPaidTimestamp),
            bitcoinPaymentDetails: donationEntity.bitcoinPaymentDetails
              ? JSON.parse(donationEntity.bitcoinPaymentDetails)
              : null,
          });
        }
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

  async createLnInvoice(
    donationEntity: DonationEntity,
    callbackUrl: string
  ): Promise<{
    bolt11: string;
    lnInvoiceStatus: string;
  }> {
    // Let's create a ln invoice

    const label: string =
      "donation-" +
      donationEntity.beneficiary.label +
      "-" +
      donationEntity.donationToken;

    const lnCreateInvoiceTO: IReqLnCreateInvoice = {
      label,
      description:
        "Thanks for your donation to " +
        donationEntity.beneficiary.description +
        "!",
      expiry: this._donationConfig.LN_EXPIRY_SECONDS,
      callbackUrl,
      msatoshi: donationEntity.lnMsatoshi,
    };
    const lnResp = await this._cyphernodeClient.lnCreateInvoice(
      lnCreateInvoiceTO
    );
    let bolt11 = null;
    let lnInvoiceStatus = null;

    // logger.debug("Donation.createDonation, lnResp:", lnResp);

    if (lnResp.result) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bolt11 = (lnResp.result as any).bolt11;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lnInvoiceStatus = (lnResp.result as any).status;
    }

    return { bolt11, lnInvoiceStatus };
  }

  async updateDonation(
    donationReq: IReqUpdateDonation
  ): Promise<IRespDonation> {
    logger.info("Donation.updateDonation, donationReq:", donationReq);

    const response: IRespDonation = {};

    if (UpdateDonationValidator.validateRequest(donationReq)) {
      // Inputs are valid.
      logger.debug("Donation.updateDonation, Inputs are valid.");

      let donationEntity = await this._donationDB.getDonationByToken(
        donationReq.donationToken
      );

      if (donationEntity != null) {
        logger.debug(
          "Donation.updateDonation, donationEntity found for this donationToken!"
        );

        if (!donationEntity.bolt11) {
          // Let's create a ln invoice
          const callbackUrl =
            this._donationConfig.URL_API_SERVER +
            ":" +
            this._donationConfig.URL_API_PORT +
            this._donationConfig.URL_CTX_WEBHOOKS +
            "/" +
            donationEntity.donationToken;

          donationEntity.lnMsatoshi = donationReq.lnMsatoshi;

          const { bolt11, lnInvoiceStatus } = await this.createLnInvoice(
            donationEntity,
            callbackUrl
          );
          donationEntity.bolt11 = bolt11;

          donationEntity = await this._donationDB.saveDonation(donationEntity);

          response.result = {
            donationToken: donationEntity.donationToken,
            bitcoinAddress: donationEntity.bitcoinAddress,
            bitcoinAmount: donationEntity.bitcoinAmount,
            bolt11: donationEntity.bolt11,
            lnInvoiceStatus,
            lnMsatoshi: donationEntity.lnMsatoshi,
            beneficiaryDescription: donationEntity.beneficiary.description,
          };
          if (donationEntity.lnPaidTimestamp) {
            response.result = Object.assign(response.result, {
              lnPaidTimestamp: new Date(donationEntity.lnPaidTimestamp),
              lnPaymentDetails: donationEntity.lnPaymentDetails
                ? JSON.parse(donationEntity.lnPaymentDetails)
                : null,
            });
          }
          if (donationEntity.bitcoinPaidTimestamp) {
            response.result = Object.assign(response.result, {
              bitcoinPaidTimestamp: new Date(
                donationEntity.bitcoinPaidTimestamp
              ),
              bitcoinPaymentDetails: donationEntity.bitcoinPaymentDetails
                ? JSON.parse(donationEntity.bitcoinPaymentDetails)
                : null,
            });
          }
        } else {
          // Active Donation not found
          logger.debug(
            "Donation.updateDonation, Donation already has a bolt11."
          );

          response.error = {
            code: ErrorCodes.InvalidRequest,
            message: "Donation already has a bolt11",
          };
        }
      } else {
        // Active Donation not found
        logger.debug("Donation.updateDonation, Donation not found.");

        response.error = {
          code: ErrorCodes.InvalidRequest,
          message: "Donation not found",
        };
      }
    } else {
      // There is an error with inputs
      logger.debug("Donation.updateDonation, there is an error with inputs.");

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

        let lnInvoiceStatus = null;

        if (donationEntity.bolt11) {
          const label: string =
            "donation-" +
            donationEntity.beneficiary.label +
            "-" +
            donationEntity.donationToken;

          const lnResp = await this._cyphernodeClient.lnGetInvoice(label);

          // logger.debug("Donation.getDonation, lnResp:", lnResp);

          if (lnResp.result) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            lnInvoiceStatus = (lnResp.result as any).invoices[0].status;
          }
          logger.debug(
            "Donation.getDonation, lnInvoiceStatus:",
            lnInvoiceStatus
          );
        }

        response.result = {
          donationToken: donationEntity.donationToken,
          bitcoinAddress: donationEntity.bitcoinAddress,
          bitcoinAmount: donationEntity.bitcoinAmount,
          bolt11: donationEntity.bolt11,
          lnInvoiceStatus,
          lnMsatoshi: donationEntity.lnMsatoshi,
          beneficiaryDescription: donationEntity.beneficiary.description,
        };
        if (donationEntity.lnPaidTimestamp) {
          response.result = Object.assign(response.result, {
            lnPaidTimestamp: new Date(donationEntity.lnPaidTimestamp),
            lnPaymentDetails: donationEntity.lnPaymentDetails
              ? JSON.parse(donationEntity.lnPaymentDetails)
              : null,
          });
        }
        if (donationEntity.bitcoinPaidTimestamp) {
          response.result = Object.assign(response.result, {
            bitcoinPaidTimestamp: new Date(donationEntity.bitcoinPaidTimestamp),
            bitcoinPaymentDetails: donationEntity.bitcoinPaymentDetails
              ? JSON.parse(donationEntity.bitcoinPaymentDetails)
              : null,
          });
        }
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

  async createBeneficiary(
    beneficiaryReq: IReqBeneficiary
  ): Promise<IRespBeneficiary> {
    logger.info("Donation.createBeneficiary, beneficiaryReq:", beneficiaryReq);

    const response: IRespBeneficiary = {};

    if (CreateBeneficiaryValidator.validateRequest(beneficiaryReq)) {
      // Inputs are valid.
      logger.debug("Donation.createBeneficiary, Inputs are valid.");

      let beneficiaryEntity;
      try {
        beneficiaryEntity = await this._donationDB.saveBeneficiary(
          beneficiaryReq as BeneficiaryEntity
        );

        response.result = beneficiaryEntity;
      } catch (ex) {
        logger.debug("ex:", ex);

        response.error = {
          code: ErrorCodes.InvalidRequest,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          message: (ex as any).message,
        };
      }
    } else {
      // There is an error with inputs
      logger.debug(
        "Donation.createBeneficiary, there is an error with inputs."
      );

      response.error = {
        code: ErrorCodes.InvalidRequest,
        message: "Invalid arguments",
      };
    }

    logger.debug("Donation.createBeneficiary, responding:", response);

    return response;
  }

  async getBeneficiary(beneficiaryId: number): Promise<IRespBeneficiary> {
    logger.info("Donation.getBeneficiary, beneficiaryId:", beneficiaryId);

    const response: IRespBeneficiary = {};

    if (beneficiaryId) {
      // Inputs are valid.
      logger.debug("Donation.getBeneficiary, Inputs are valid.");

      const beneficiaryEntity = await this._donationDB.getBeneficiaryById(
        beneficiaryId
      );

      if (beneficiaryEntity != null) {
        logger.debug(
          "Donation.getBeneficiary, beneficiaryEntity found for this beneficiaryId!"
        );

        response.result = beneficiaryEntity;
      } else {
        // Beneficiary not found
        logger.debug("Donation.getBeneficiary, Beneficiary not found.");

        response.error = {
          code: ErrorCodes.InvalidRequest,
          message: "Beneficiary not found",
        };
      }
    } else {
      // There is an error with inputs
      logger.debug("Donation.getBeneficiary, there is an error with inputs.");

      response.error = {
        code: ErrorCodes.InvalidRequest,
        message: "Invalid arguments",
      };
    }

    logger.debug("Donation.getBeneficiary, responding:", response);

    return response;
  }

  async updateBeneficiary(
    beneficiaryReq: IReqBeneficiary
  ): Promise<IRespBeneficiary> {
    logger.info("Donation.updateBeneficiary, beneficiaryReq:", beneficiaryReq);

    const response: IRespBeneficiary = {};

    if (UpdateBeneficiaryValidator.validateRequest(beneficiaryReq)) {
      // Inputs are valid.
      logger.debug("Donation.updateBeneficiary, Inputs are valid.");

      let beneficiaryEntity;
      if (beneficiaryReq.beneficiaryId) {
        beneficiaryEntity = await this._donationDB.getBeneficiaryById(
          beneficiaryReq.beneficiaryId
        );
      } else {
        beneficiaryEntity = await this._donationDB.getBeneficiaryByLabel(
          beneficiaryReq.label
        );
      }

      if (beneficiaryEntity) {
        logger.debug(
          "Donation.updateBeneficiary, beneficiaryEntity found for this beneficiaryId!"
        );

        try {
          beneficiaryEntity = await this._donationDB.saveBeneficiary(
            Object.assign(beneficiaryReq, {
              beneficiaryId: beneficiaryEntity.beneficiaryId,
            }) as BeneficiaryEntity
          );
          // logger.debug(
          //   "Donation.updateBeneficiary, beneficiaryEntity =",
          //   beneficiaryEntity
          // );

          response.result = beneficiaryEntity;
        } catch (ex) {
          logger.debug("ex:", ex);

          response.error = {
            code: ErrorCodes.InvalidRequest,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message: (ex as any).message,
          };
        }
      } else {
        // Beneficiary not found
        logger.debug("Donation.updateBeneficiary, Beneficiary not found.");

        response.error = {
          code: ErrorCodes.InvalidRequest,
          message: "Beneficiary not found",
        };
      }
    } else {
      // There is an error with inputs
      logger.debug(
        "Donation.updateBeneficiary, there is an error with inputs."
      );

      response.error = {
        code: ErrorCodes.InvalidRequest,
        message: "Invalid arguments",
      };
    }

    logger.debug("Donation.updateBeneficiary, responding:", response);

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
        donationEntity.lnPaidTimestamp = new Date().valueOf();
        donationEntity.lnMsatoshi = webhookBody.msatoshi_received;
        // if (donationEntity.cnWatchId) {
        //   this._cyphernodeClient.unwatch(donationEntity.cnWatchId);
        // }
      } else {
        // This means the payment was made on-chain
        donationEntity.bitcoinPaymentDetails = JSON.stringify(webhookBody);
        donationEntity.bitcoinPaidTimestamp = new Date().valueOf();
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
