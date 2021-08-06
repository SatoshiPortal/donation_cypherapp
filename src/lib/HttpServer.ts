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
import { CyphernodeClient } from "./CyphernodeClient";
import { DonationDB } from "./DonationDB";
import IReqCreateDonation from "../types/IReqCreateDonation";
import { Donation } from "./Donation";
import IRespDonation from "../types/IRespDonation";

class HttpServer {
  // Create a new express application instance
  private readonly _httpServer: express.Application = express();
  private readonly _lock = new AsyncLock();
  private _donationConfig: DonationConfig = JSON.parse(
    fs.readFileSync("data/config.json", "utf8")
  );
  private _donationDB: DonationDB = new DonationDB(this._donationConfig);
  private _cyphernodeClient: CyphernodeClient = new CyphernodeClient(
    this._donationConfig
  );
  private _donation: Donation = new Donation(this._donationConfig);

  setup(): void {
    logger.debug("setup");
    this._httpServer.use(express.json());
    this._httpServer.set("view engine", "pug");
    logger.debug(path.join(__dirname, "scripts"));
    this._httpServer.set("views", "views");
    this._httpServer.use("/static", express.static("static"));

    this._donationDB.configureDB(this._donationConfig).then(() => {
      this._cyphernodeClient = new CyphernodeClient(this._donationConfig);
    });
  }

  async loadConfig(): Promise<void> {
    logger.debug("loadConfig");

    this._donationConfig = JSON.parse(
      fs.readFileSync("data/config.json", "utf8")
    );
    this._cyphernodeClient.configureCyphernode(this._donationConfig);

    this._donationDB.configureDB(this._donationConfig).then(() => {
      this._cyphernodeClient.configureCyphernode(this._donationConfig);
    });
  }

  async createDonation(params: object | undefined): Promise<IRespDonation> {
    logger.debug("/createDonation params:", params);

    // - address, required, desination address
    // - amount, required, amount to send to the destination address
    // - batcherId, optional, the id of the batcher to which the output will be added, default batcher if not supplied, overrides batcherLabel
    // - batcherLabel, optional, the label of the batcher to which the output will be added, default batcher if not supplied
    // - webhookUrl, optional, the webhook to call when the batch is broadcast

    const reqCreateDonation: IReqCreateDonation = params as IReqCreateDonation;
    logger.debug("reqCreateDonation:", reqCreateDonation);

    return await this._donation.createDonation(reqCreateDonation);
  }

  async getDonation(params: object | undefined): Promise<IRespDonation> {
    logger.debug("/getDonation params:", params);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const donationToken = (params as any).donationToken;

    return await this._donation.getDonation(donationToken);
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
          bolt11: "Error",
          bitcoinAddress: this._donationConfig.DONATION_BITCOIN_ADDRESS,
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
