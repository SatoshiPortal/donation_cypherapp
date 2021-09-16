// lib/HttpServer.ts
import express from "express";
import logger from "./Log2File";
import AsyncLock from "async-lock";
import DonationConfig from "../config/DonationConfig";
import fs from "fs";
import {
  IResponseMessage,
  ErrorCodes,
} from "../types/jsonrpc/IResponseMessage";
import { IRequestMessage } from "../types/jsonrpc/IRequestMessage";
import path from "path";
// import { CyphernodeClient } from "./CyphernodeClient";
// import { DonationDB } from "./DonationDB";
import IReqCreateDonation from "../types/IReqCreateDonation";
import { Donation } from "./Donation";
import IRespDonation from "../types/IRespDonation";
import IReqUpdateDonation from "../types/IReqUpdateDonation";
import IReqBeneficiary from "../types/IReqBeneficiary";
import IRespBeneficiary from "../types/IRespBeneficiary";

class HttpServer {
  // Create a new express application instance
  private readonly _httpServer: express.Application = express();
  private readonly _lock = new AsyncLock();
  private _donationConfig: DonationConfig = JSON.parse(
    fs.readFileSync("data/config.json", "utf8")
  );
  // private _donationDB: DonationDB = new DonationDB(this._donationConfig);
  // private _cyphernodeClient: CyphernodeClient = new CyphernodeClient(
  //   this._donationConfig
  // );
  private _donation: Donation = new Donation(this._donationConfig);

  setup(): void {
    logger.debug("setup");
    this._httpServer.use(express.json());
    this._httpServer.set("view engine", "pug");
    logger.debug(path.join(__dirname, "scripts"));
    this._httpServer.set("views", "views");
    this._httpServer.use("/static", express.static("static"));

    // this._donationDB.configureDB(this._donationConfig).then(() => {
    //   this._cyphernodeClient = new CyphernodeClient(this._donationConfig);
    // });
  }

  async loadConfig(): Promise<void> {
    logger.debug("loadConfig");

    this._donationConfig = JSON.parse(
      fs.readFileSync("data/config.json", "utf8")
    );

    this._donation.configureDonation(this._donationConfig);
    // this._donationDB.configureDB(this._donationConfig).then(() => {
    //   this._cyphernodeClient.configureCyphernode(this._donationConfig);
    // });
  }

  async createDonation(params: object | undefined): Promise<IRespDonation> {
    logger.debug("/createDonation params:", params);

    // - beneficiaryLabel, required, label of the donation beneficiary
    // - amount, optional, amount to send to the destination address

    const reqCreateDonation: IReqCreateDonation = params as IReqCreateDonation;
    logger.debug("reqCreateDonation:", reqCreateDonation);

    return await this._donation.createDonation(reqCreateDonation);
  }

  async updateDonation(params: object | undefined): Promise<IRespDonation> {
    logger.debug("/updateDonation params:", params);

    // - beneficiaryLabel, required, label of the donation beneficiary
    // - donationToken, required, donation token
    // - lnMsatoshi, optional, amount to send to the destination address

    const reqUpdateDonation: IReqUpdateDonation = params as IReqUpdateDonation;
    logger.debug("reqUpdateDonation:", reqUpdateDonation);

    return await this._donation.updateDonation(reqUpdateDonation);
  }

  async getDonation(params: object | undefined): Promise<IRespDonation> {
    logger.debug("/getDonation params:", params);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const donationToken = (params as any).donationToken;

    return await this._donation.getDonation(donationToken);
  }

  async createBeneficiary(
    params: object | undefined
  ): Promise<IRespBeneficiary> {
    logger.debug("/createBeneficiary params:", params);

    // - label, required, label of the beneficiary

    const reqCreateBeneficiary: IReqBeneficiary = params as IReqBeneficiary;
    logger.debug("reqCreateBeneficiary:", reqCreateBeneficiary);

    return await this._donation.createBeneficiary(reqCreateBeneficiary);
  }

  async getBeneficiary(params: object | undefined): Promise<IRespBeneficiary> {
    logger.debug("/getBeneficiary params:", params);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const beneficiaryId = (params as any).beneficiaryId;

    return await this._donation.getBeneficiary(beneficiaryId);
  }

  async updateBeneficiary(
    params: object | undefined
  ): Promise<IRespBeneficiary> {
    logger.debug("/updateBeneficiary params:", params);

    // - label, required, label of the beneficiary

    const reqBeneficiary: IReqBeneficiary = params as IReqBeneficiary;
    logger.debug("reqBeneficiary:", reqBeneficiary);

    return await this._donation.updateBeneficiary(reqBeneficiary);
  }

  async start(): Promise<void> {
    logger.info("Starting incredible service");

    this.setup();

    this._httpServer.post(
      this._donationConfig.URL_API_CTX,
      async (req, res) => {
        logger.debug(this._donationConfig.URL_API_CTX);

        const reqMessage: IRequestMessage = req.body;
        logger.debug("reqMessage.method:", reqMessage.method);
        logger.debug("reqMessage.params:", reqMessage.params);

        const response: IResponseMessage = {
          id: reqMessage.id,
        } as IResponseMessage;

        // Check the method and call the corresponding function
        switch (reqMessage.method) {
          case "createDonation": {
            let result: IRespDonation = {};

            result = await this._lock.acquire(
              "donationModif",
              async (): Promise<IRespDonation> => {
                logger.debug("acquired lock donationModif in createDonation");
                return await this.createDonation(reqMessage.params || {});
              }
            );
            logger.debug("released lock donationModif in createDonation");

            response.result = result.result;
            response.error = result.error;
            break;
          }

          case "updateDonation": {
            let result: IRespDonation = {};

            result = await this._lock.acquire(
              "donationModif",
              async (): Promise<IRespDonation> => {
                logger.debug("acquired lock donationModif in updateDonation");
                return await this.updateDonation(reqMessage.params || {});
              }
            );
            logger.debug("released lock donationModif in updateDonation");

            response.result = result.result;
            response.error = result.error;
            break;
          }

          case "getDonation": {
            let result: IRespDonation = {};

            result = await this._lock.acquire(
              "donationModif",
              async (): Promise<IRespDonation> => {
                logger.debug("acquired lock donationModif in getDonation");
                return await this.getDonation(reqMessage.params || {});
              }
            );
            logger.debug("released lock donationModif in getDonation");

            response.result = result.result;
            response.error = result.error;

            break;
          }

          case "createBeneficiary": {
            let result: IRespBeneficiary = {};

            result = await this.createBeneficiary(reqMessage.params || {});

            response.result = result.result;
            response.error = result.error;
            break;
          }

          case "getBeneficiary": {
            let result: IRespBeneficiary = {};

            result = await this.getBeneficiary(reqMessage.params || {});

            response.result = result.result;
            response.error = result.error;

            break;
          }

          case "updateBeneficiary": {
            let result: IRespBeneficiary = {};

            result = await this._lock.acquire(
              "beneficiaryModif",
              async (): Promise<IRespBeneficiary> => {
                logger.debug(
                  "acquired lock beneficiaryModif in updateBeneficiary"
                );
                return await this.updateBeneficiary(reqMessage.params || {});
              }
            );
            logger.debug("released lock beneficiaryModif in updateBeneficiary");

            response.result = result.result;
            response.error = result.error;
            break;
          }

          case "reloadConfig":
            await this.loadConfig();

          // eslint-disable-next-line no-fallthrough
          case "getConfig":
            response.result = this._donationConfig;
            break;

          default:
            response.error = {
              code: ErrorCodes.MethodNotFound,
              message: "No such method!",
            };
            break;
        }

        if (response.error) {
          response.error.data = reqMessage.params as never;
          res.status(400).json(response);
        } else {
          res.status(200).json(response);
        }
      }
    );

    this._httpServer.get("/:beneficiaryLabel", async (req, res) => {
      logger.debug("Get donation page:", req.params.beneficiaryLabel);

      const respDonation: IRespDonation = await this.createDonation({
        beneficiaryLabel: req.params.beneficiaryLabel,
      });

      if (respDonation.result) {
        res.render("index", {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          bolt11: respDonation.result.bolt11,
          bitcoinAddress: respDonation.result.bitcoinAddress,
        });
      } else {
        res.render("index", {
          bolt11: respDonation.error?.message,
          bitcoinAddress: respDonation.error?.message,
        });
      }
    });

    this._httpServer.post(
      this._donationConfig.URL_CTX_WEBHOOKS + "/:donationToken",
      async (req, res) => {
        logger.info(
          this._donationConfig.URL_CTX_WEBHOOKS +
            "/" +
            req.params.donationToken +
            ":",
          req.body
        );

        const response = await this._donation.processWebhooks(
          req.params.donationToken,
          req.body
        );

        if (response.error) {
          res.status(400).json(response);
        } else {
          res.status(200).json(response);
        }
      }
    );

    this._httpServer.listen(this._donationConfig.URL_API_PORT, () => {
      logger.info(
        "Express HTTP server listening on port:",
        this._donationConfig.URL_API_PORT
      );
    });
  }
}

export { HttpServer };
