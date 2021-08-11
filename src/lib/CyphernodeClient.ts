import logger from "./Log2File";
import crypto from "crypto";
import axios, { AxiosRequestConfig } from "axios";
import https from "https";
import path from "path";
import fs from "fs";
import DonationConfig from "../config/DonationConfig";
import IRespGetBatchDetails from "../types/cyphernode/IRespGetBatchDetails";
import IRespAddToBatch from "../types/cyphernode/IRespAddToBatch";
import IReqBatchSpend from "../types/cyphernode/IReqBatchSpend";
import IReqGetBatchDetails from "../types/cyphernode/IReqGetBatchDetails";
import IRespBatchSpend from "../types/cyphernode/IRespBatchSpend";
import IReqAddToBatch from "../types/cyphernode/IReqAddToBatch";
import { IResponseError, ErrorCodes } from "../types/jsonrpc/IResponseMessage";
import IReqSpend from "../types/cyphernode/IReqSpend";
import IRespSpend from "../types/cyphernode/IRespSpend";
import IReqLnPay from "../types/cyphernode/IReqLnPay";
import IRespLnPay from "../types/cyphernode/IRespLnPay";
import IRespLnCreateInvoice from "../types/cyphernode/IRespLnCreateInvoice";
import IReqLnCreateInvoice from "../types/cyphernode/IReqLnCreateInvoice";
import IRespGetNewAddress from "../types/cyphernode/IRespGetNewAddress";
import IRespDerivePubPath from "../types/cyphernode/IRespDerivePubPath";
import IReqDerivePubPath from "../types/cyphernode/IReqDerivePubPath";
import IRespWatch from "../types/cyphernode/IRespWatch";
import IReqWatch from "../types/cyphernode/IReqWatch";
import IReqGetNewWasabiAddress from "../types/cyphernode/IReqGetNewWasabiAddress";
import IRespGetNewWasabiAddress from "../types/cyphernode/IRespGetNewWasabiAddress";
import IReqGetNewAddress from "../types/cyphernode/IReqGetNewAddress";

class CyphernodeClient {
  private baseURL: string;
  private readonly h64: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9Cg==";
  private apiId: string;
  private apiKey: string;
  private caFile: string;

  constructor(donationConfig: DonationConfig) {
    this.baseURL = donationConfig.CN_URL;
    this.apiId = donationConfig.CN_API_ID;
    this.apiKey = donationConfig.CN_API_KEY;
    this.caFile = path.resolve(donationConfig.BASE_DIR, "cert.pem");
  }

  configureCyphernode(donationConfig: DonationConfig): void {
    this.baseURL = donationConfig.CN_URL;
    this.apiId = donationConfig.CN_API_ID;
    this.apiKey = donationConfig.CN_API_KEY;
    this.caFile = path.resolve(donationConfig.BASE_DIR, "cert.pem");
  }

  _generateToken(): string {
    logger.info("CyphernodeClient._generateToken");

    const current = Math.round(new Date().getTime() / 1000) + 10;
    const p = '{"id":"' + this.apiId + '","exp":' + current + "}";
    const p64 = Buffer.from(p).toString("base64");
    const msg = this.h64 + "." + p64;
    const s = crypto
      .createHmac("sha256", this.apiKey)
      .update(msg)
      .digest("hex");
    const token = msg + "." + s;

    logger.debug("CyphernodeClient._generateToken :: token=" + token);

    return token;
  }

  async _post(
    url: string,
    postdata: unknown,
    addedOptions?: unknown
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    logger.info("CyphernodeClient._post:", url, postdata, addedOptions);

    let configs: AxiosRequestConfig = {
      url: url,
      method: "post",
      baseURL: this.baseURL,
      headers: {
        Authorization: "Bearer " + this._generateToken(),
      },
      data: postdata,
      httpsAgent: new https.Agent({
        ca: fs.readFileSync(this.caFile),
        // rejectUnauthorized: false,
      }),
    };
    if (addedOptions) {
      configs = Object.assign(configs, addedOptions);
    }

    // logger.debug(
    //   "CyphernodeClient._post :: configs: %s",
    //   JSON.stringify(configs)
    // );

    try {
      const response = await axios.request(configs);
      logger.debug("CyphernodeClient._post :: response.data:", response.data);

      return { status: response.status, data: response.data };
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        logger.info(
          "CyphernodeClient._post :: error.response.data:",
          error.response.data
        );
        logger.info(
          "CyphernodeClient._post :: error.response.status:",
          error.response.status
        );
        logger.info(
          "CyphernodeClient._post :: error.response.headers:",
          error.response.headers
        );

        return { status: error.response.status, data: error.response.data };
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        logger.info("CyphernodeClient._post :: error.message:", error.message);

        return { status: -1, data: error.message };
      } else {
        // Something happened in setting up the request that triggered an Error
        logger.info("CyphernodeClient._post :: Error:", error.message);

        return { status: -2, data: error.message };
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async _get(url: string, addedOptions?: unknown): Promise<any> {
    logger.info("CyphernodeClient._get:", url, addedOptions);

    let configs: AxiosRequestConfig = {
      url: url,
      method: "get",
      baseURL: this.baseURL,
      headers: {
        Authorization: "Bearer " + this._generateToken(),
      },
      httpsAgent: new https.Agent({
        ca: fs.readFileSync(this.caFile),
        // rejectUnauthorized: false,
      }),
    };
    if (addedOptions) {
      configs = Object.assign(configs, addedOptions);
    }

    try {
      const response = await axios.request(configs);
      logger.debug("CyphernodeClient._get :: response.data:", response.data);

      return { status: response.status, data: response.data };
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        logger.info(
          "CyphernodeClient._get :: error.response.data:",
          error.response.data
        );
        logger.info(
          "CyphernodeClient._get :: error.response.status:",
          error.response.status
        );
        logger.info(
          "CyphernodeClient._get :: error.response.headers:",
          error.response.headers
        );

        return { status: error.response.status, data: error.response.data };
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        logger.info("CyphernodeClient._get :: error.message:", error.message);

        return { status: -1, data: error.message };
      } else {
        // Something happened in setting up the request that triggered an Error
        logger.info("CyphernodeClient._get :: Error:", error.message);

        return { status: -2, data: error.message };
      }
    }
  }

  async addToBatch(batchRequestTO: IReqAddToBatch): Promise<IRespAddToBatch> {
    // POST http://192.168.111.152:8080/addtobatch

    // args:
    // - address, required, desination address
    // - amount, required, amount to send to the destination address
    // - batchId, optional, the id of the batch to which the output will be added, default batch if not supplied, overrides batchLabel
    // - batchLabel, optional, the label of the batch to which the output will be added, default batch if not supplied
    // - webhookUrl, optional, the webhook to call when the batch is broadcast

    // response:
    // - donationId, the id of the donation
    // - outputId, the id of the added output
    // - nbOutputs, the number of outputs currently in the batch
    // - oldest, the timestamp of the oldest output in the batch
    // - total, the current sum of the batch's output amounts

    // BODY {"address":"2N8DcqzfkYi8CkYzvNNS5amoq3SbAcQNXKp","amount":0.00233}
    // BODY {"address":"2N8DcqzfkYi8CkYzvNNS5amoq3SbAcQNXKp","amount":0.00233,"batchId":34,"webhookUrl":"https://myCypherApp:3000/batchExecuted"}
    // BODY {"address":"2N8DcqzfkYi8CkYzvNNS5amoq3SbAcQNXKp","amount":0.00233,"batchLabel":"lowfees","webhookUrl":"https://myCypherApp:3000/batchExecuted"}
    // BODY {"address":"2N8DcqzfkYi8CkYzvNNS5amoq3SbAcQNXKp","amount":0.00233,"batchId":34,"webhookUrl":"https://myCypherApp:3000/batchExecuted"}

    logger.info("CyphernodeClient.addToBatch:", batchRequestTO);

    let result: IRespAddToBatch;
    const response = await this._post("/addtobatch", batchRequestTO);

    if (response.status >= 200 && response.status < 400) {
      result = { result: response.data.result };
    } else {
      result = {
        error: {
          code: response.data.error.code,
          message: response.data.error.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as IResponseError<any>,
      } as IRespBatchSpend;
    }
    return result;
  }

  async removeFromBatch(outputId: number): Promise<IRespAddToBatch> {
    // POST http://192.168.111.152:8080/removefrombatch
    //
    // args:
    // - outputId, required, id of the output to remove
    //
    // response:
    // - donationId, the id of the donation
    // - outputId, the id of the removed output if found
    // - nbOutputs, the number of outputs currently in the batch
    // - oldest, the timestamp of the oldest output in the batch
    // - total, the current sum of the batch's output amounts
    //
    // BODY {"id":72}

    logger.info("CyphernodeClient.removeFromBatch:", outputId);

    let result: IRespAddToBatch;
    const response = await this._post("/removefrombatch", {
      outputId,
    });

    if (response.status >= 200 && response.status < 400) {
      result = { result: response.data.result };
    } else {
      result = {
        error: {
          code: response.data.error.code,
          message: response.data.error.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as IResponseError<any>,
      } as IRespBatchSpend;
    }
    return result;
  }

  async getBatchDetails(
    batchIdent: IReqGetBatchDetails
  ): Promise<IRespGetBatchDetails> {
    // POST (GET) http://192.168.111.152:8080/getbatchdetails
    //
    // args:
    // - donationId, optional, id of the donation, overrides donationLabel, default donation will be spent if not supplied
    // - donationLabel, optional, label of the donation, default donation will be used if not supplied
    // - txid, optional, if you want the details of an executed batch, supply the batch txid, will return current pending batch
    //     if not supplied
    //
    // response:
    // {"result":{
    //    "donationId":34,
    //    "donationLabel":"Special donation for a special client",
    //    "confTarget":6,
    //    "nbOutputs":83,
    //    "oldest":123123,
    //    "total":10.86990143,
    //    "txid":"af867c86000da76df7ddb1054b273ca9e034e8c89d049b5b2795f9f590f67648",
    //    "hash":"af867c86000da76df7ddb1054b273ca9e034e8c89d049b5b2795f9f590f67648",
    //    "details":{
    //      "firstseen":123123,
    //      "size":424,
    //      "vsize":371,
    //      "replaceable":true,
    //      "fee":0.00004112
    //    },
    //    "outputs":[
    //      "1abc":0.12,
    //      "3abc":0.66,
    //      "bc1abc":2.848,
    //      ...
    //    ]
    //  }
    // },"error":null}
    //
    // BODY {}
    // BODY {"donationId":34}

    logger.info("CyphernodeClient.getBatchDetails:", batchIdent);

    let result: IRespGetBatchDetails;
    const response = await this._post("/getbatchdetails", batchIdent);

    if (response.status >= 200 && response.status < 400) {
      result = { result: response.data.result };
    } else {
      result = {
        error: {
          code: response.data.error.code,
          message: response.data.error.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as IResponseError<any>,
      } as IRespBatchSpend;
    }
    return result;
  }

  async batchSpend(batchSpendTO: IReqBatchSpend): Promise<IRespBatchSpend> {
    // POST http://192.168.111.152:8080/batchspend
    //
    // args:
    // - donationId, optional, id of the donation to execute, overrides donationLabel, default donation will be spent if not supplied
    // - donationLabel, optional, label of the donation to execute, default donation will be executed if not supplied
    // - confTarget, optional, overrides default value of createdonation, default to value of createdonation, default Bitcoin Core conf_target will be used if not supplied
    // NOTYET - feeRate, optional, overrides confTarget if supplied, overrides default value of createdonation, default to value of createdonation, default Bitcoin Core value will be used if not supplied
    //
    // response:
    // - txid, the transaction txid
    // - hash, the transaction hash
    // - nbOutputs, the number of outputs spent in the batch
    // - oldest, the timestamp of the oldest output in the spent batch
    // - total, the sum of the spent batch's output amounts
    // - tx details: size, vsize, replaceable, fee
    // - outputs
    //
    // {"result":{
    //    "donationId":34,
    //    "donationLabel":"Special donation for a special client",
    //    "confTarget":6,
    //    "nbOutputs":83,
    //    "oldest":123123,
    //    "total":10.86990143,
    //    "txid":"af867c86000da76df7ddb1054b273ca9e034e8c89d049b5b2795f9f590f67648",
    //    "hash":"af867c86000da76df7ddb1054b273ca9e034e8c89d049b5b2795f9f590f67648",
    //    "details":{
    //      "firstseen":123123,
    //      "size":424,
    //      "vsize":371,
    //      "replaceable":true,
    //      "fee":0.00004112
    //    },
    //    "outputs":{
    //      "1abc":0.12,
    //      "3abc":0.66,
    //      "bc1abc":2.848,
    //      ...
    //    }
    //  }
    // },"error":null}
    //
    // BODY {}
    // BODY {"donationId":34,"confTarget":12}
    // NOTYET BODY {"donationLabel":"highfees","feeRate":233.7}
    // BODY {"donationId":411,"confTarget":6}

    logger.info("CyphernodeClient.batchSpend:", batchSpendTO);

    let result: IRespBatchSpend;
    const response = await this._post("/batchspend", batchSpendTO);
    if (response.status >= 200 && response.status < 400) {
      result = { result: response.data.result };
    } else {
      result = {
        error: {
          code: response.data.error.code,
          message: response.data.error.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as IResponseError<any>,
      } as IRespBatchSpend;
    }
    return result;
  }

  async spend(spendTO: IReqSpend): Promise<IRespSpend> {
    // POST http://192.168.111.152:8080/spend
    // BODY {"address":"2N8DcqzfkYi8CkYzvNNS5amoq3SbAcQNXKp","amount":0.00233,"confTarget":6,"replaceable":true,"subtractfeefromamount":false}

    // args:
    // - address, required, desination address
    // - amount, required, amount to send to the destination address
    // - confTarget, optional, overrides default value, default Bitcoin Core conf_target will be used if not supplied
    // - replaceable, optional, overrides default value, default Bitcoin Core walletrbf will be used if not supplied
    // - subtractfeefromamount, optional, if true will subtract fee from the amount sent instead of adding to it
    //
    // response:
    // - txid, the transaction txid
    // - hash, the transaction hash
    // - tx details: address, aount, firstseen, size, vsize, replaceable, fee, subtractfeefromamount
    //
    // {"result":{
    //    "status":"accepted",
    //    "txid":"af867c86000da76df7ddb1054b273ca9e034e8c89d049b5b2795f9f590f67648",
    //    "hash":"af867c86000da76df7ddb1054b273ca9e034e8c89d049b5b2795f9f590f67648",
    //    "details":{
    //      "address":"2N8DcqzfkYi8CkYzvNNS5amoq3SbAcQNXKp",
    //      "amount":0.00233,
    //      "firstseen":123123,
    //      "size":424,
    //      "vsize":371,
    //      "replaceable":true,
    //      "fee":0.00004112,
    //      "subtractfeefromamount":true
    //    }
    //  }
    // },"error":null}
    //
    // BODY {"address":"2N8DcqzfkYi8CkYzvNNS5amoq3SbAcQNXKp","amount":0.00233}

    logger.info("CyphernodeClient.spend:", spendTO);

    let result: IRespSpend;
    const response = await this._post("/spend", spendTO);
    if (response.status >= 200 && response.status < 400) {
      result = { result: response.data };
    } else {
      result = {
        error: {
          code: ErrorCodes.InternalError,
          message: response.data.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as IResponseError<any>,
      } as IRespSpend;
    }
    return result;
  }

  async lnPay(lnPayTO: IReqLnPay): Promise<IRespLnPay> {
    // POST http://192.168.111.152:8080/ln_pay
    // BODY {"bolt11":"lntb1pdca82tpp5g[...]9wafq9n4w28amnmwzujgqpmapcr3",
    // "expected_msatoshi":"10000","expected_description":"Bitcoin Outlet order #7082"}

    // args:
    // - bolt11, required, lightning network bolt11 invoice
    // - expected_msatoshi, optional, amount we want to send, expected to be the same amount as the one encoded in the bolt11 invoice
    // - expected_description, optional, expected description encoded in the bolt11 invoice
    //
    //  Example of error result:
    //
    //  { "code" : 204, "message" : "failed: WIRE_TEMPORARY_CHANNEL_FAILURE (Outgoing subdaemon died)", "data" :
    //  {
    //    "erring_index": 0,
    //    "failcode": 4103,
    //    "erring_node": "031b867d9d6631a1352cc0f37bcea94bd5587a8d4f40416c4ce1a12511b1e68f56",
    //    "erring_channel": "1452982:62:0"
    //  } }
    //
    //
    //  Example of successful result:
    //
    //  {
    //    "id": 44,
    //    "payment_hash": "de648062da7117903291dab2075881e49ddd78efbf82438e4a2f486a7ebe0f3a",
    //    "destination": "02be93d1dad1ccae7beea7b42f8dbcfbdafb4d342335c603125ef518200290b450",
    //    "msatoshi": 207000,
    //    "msatoshi_sent": 207747,
    //    "created_at": 1548380406,
    //    "status": "complete",
    //    "payment_preimage": "a7ef27e9a94d63e4028f35ca4213fd9008227ad86815cd40d3413287d819b145",
    //    "description": "Order 43012 - Satoshi Larrivee",
    //    "getroute_tries": 1,
    //    "sendpay_tries": 1,
    //    "route": [
    //      {
    //        "id": "02be93d1dad1ccae7beea7b42f8dbcfbdafb4d342335c603125ef518200290b450",
    //        "channel": "1452749:174:0",
    //        "msatoshi": 207747,
    //        "delay": 10
    //      }
    //    ],
    //    "failures": [
    //    ]
    //  }

    logger.info("CyphernodeClient.lnPay:", lnPayTO);

    let result: IRespLnPay;
    const response = await this._post("/ln_pay", lnPayTO);
    if (response.status >= 200 && response.status < 400) {
      result = { result: response.data };
    } else {
      result = {
        error: {
          code: ErrorCodes.InternalError,
          message: response.data.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as IResponseError<any>,
      } as IRespLnPay;
    }
    return result;
  }

  async lnCreateInvoice(
    lnCreateInvoiceTO: IReqLnCreateInvoice
  ): Promise<IRespLnCreateInvoice> {
    // POST http://192.168.111.152:8080/ln_create_invoice
    // BODY {"msatoshi":20718000,"label":"183972-1627669710343","description":"Order 183972 - John Doe","expiry":900,
    //   "callbackUrl":"https://myexchange/webhooks/lninvoicepaid"}

    // args:
    // - msatoshi, optional, amount in milli-satoshi, will be "any" if not supplied
    // - label, required, must be a unique string
    // - description, required, string representing a short description of the invoice
    // - expiry, optional, in seconds
    // - callbackUrl. optional, the URL that will be called when the invoice is paid
    //
    // ln_create_invoice response from Cyphernode:
    // {
    //   "id":"475",
    //   "label":"183972-1627669710343",
    //   "bolt11":"lntb207180n1pssg3xwpp5ctj...wdrk6vdqxh2947fny37qegvl60eyezr2sppjtmwk",
    //   "connectstring":"021ec6cced...ebb03487a@117.7.217.122:9735",
    //   "callbackUrl":"https://myexchange/webhooks/lninvoicepaid",
    //   "payment_hash":"c2e4f6dbd8f088735d8dcd92d50ef588db2eff4ae0c91a891bb66c71fef0d73a",
    //   "msatoshi":20718000,
    //   "status":"unpaid",
    //   "description":"Order 183972 - John Doe",
    //   "expires_at":1627670610
    // }

    logger.info("CyphernodeClient.lnCreateInvoice:", lnCreateInvoiceTO);

    let result: IRespLnCreateInvoice;
    const response = await this._post("/ln_create_invoice", lnCreateInvoiceTO);
    if (response.status >= 200 && response.status < 400) {
      result = { result: response.data };
    } else {
      result = {
        error: {
          code: ErrorCodes.InternalError,
          message: response.data.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as IResponseError<any>,
      } as IRespLnCreateInvoice;
    }
    return result;
  }

  async lnGetInvoice(label: string): Promise<IRespLnCreateInvoice> {
    // GET http://192.168.111.152:8080/ln_getinvoice/label

    // ln_getinvoice response from Cyphernode:

    logger.info("CyphernodeClient.lnGetInvoice:", label);

    let result: IRespLnCreateInvoice;
    const response = await this._get("/ln_getinvoice/" + label);
    if (response.status >= 200 && response.status < 400) {
      result = { result: response.data };
    } else {
      result = {
        error: {
          code: ErrorCodes.InternalError,
          message: response.data.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as IResponseError<any>,
      } as IRespLnCreateInvoice;
    }
    return result;
  }

  async getNewBitcoinAddress(
    newAddressTO: IReqGetNewAddress
  ): Promise<IRespGetNewAddress> {
    // GET http://192.168.111.152:8080/getnewaddress
    // or...
    // POST http://192.168.111.152:8080/getnewaddress
    // BODY {"address_type":"bech32","label":"myLabel"}
    // BODY {"label":"myLabel"}
    // BODY {"address_type":"p2sh-segwit"}
    // BODY {}

    // getnewaddress response from Cyphernode:
    // {"address":"bc1address","label":"myLabel","address_type":"bech32"}

    logger.info("CyphernodeClient.getNewBitcoinAddress");

    let result: IRespGetNewAddress;
    const response = await this._post("/getnewaddress", newAddressTO);
    // const response = await this._get("/getnewaddress");
    if (response.status >= 200 && response.status < 400) {
      result = { result: response.data };
    } else {
      result = {
        error: {
          code: ErrorCodes.InternalError,
          message: response.data.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as IResponseError<any>,
      } as IRespGetNewAddress;
    }
    return result;
  }

  async derivePubPath(
    pubPathTO: IReqDerivePubPath
  ): Promise<IRespDerivePubPath> {
    // POST http://192.168.111.152:8080/derivepubpath
    // BODY {"pub32":"tpubD6NzVbkrYhZ4YR3QK2tyfMMvBghAvqtNaNK1LTyDWcRHLcMUm3ZN2cGm5BS3MhCRCeCkXQkTXXjiJgqxpqXK7PeUSp86DTTgkLpcjMtpKWk","path":"0/25-30"}

    // args:
    // - pub32, required, xpub/ypub/zpub/tpub/upub/vpub used to derive address(es)
    // - path, required, derivation path including the index, in the form n or n-m (ex.: 0/44'/86 or 0/44'/62-77)
    //
    // derivepubpath response from Cyphernode:
    // {
    //   "addresses": [
    //     {"address": "bc1addr1"},
    //     {"address": "bc1addr2"}
    //   ]
    // }

    logger.info("CyphernodeClient.derivePubPath:", pubPathTO);

    let result: IRespDerivePubPath;
    const response = await this._post("/derivepubpath", pubPathTO);
    if (response.status >= 200 && response.status < 400) {
      result = { result: response.data };
    } else {
      result = {
        error: {
          code: ErrorCodes.InternalError,
          message: response.data.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as IResponseError<any>,
      } as IRespDerivePubPath;
    }
    return result;
  }

  async watch(watchTO: IReqWatch): Promise<IRespWatch> {
    // POST http://192.168.111.152:8080/watch
    // BODY {"address":"2N8DcqzfkYi8CkYzvNNS5amoq3SbAcQNXKp","unconfirmedCallbackURL":"192.168.111.233:1111/callback0conf","confirmedCallbackURL":"192.168.111.233:1111/callback1conf"}
    // BODY {"address":"2N8DcqzfkYi8CkYzvNNS5amoq3SbAcQNXKp","confirmedCallbackURL":"192.168.111.233:1111/callback1conf","eventMessage":"eyJib3VuY2VfYWRkcmVzcyI6IjJNdkEzeHIzOHIxNXRRZWhGblBKMVhBdXJDUFR2ZTZOamNGIiwibmJfY29uZiI6MH0K"}

    // args:
    // - address, required, watched address
    // - unconfirmedCallbackURL, optional
    // - confirmedCallbackURL, optional
    // - eventMessage, optional
    //
    // watch response from Cyphernode:
    // "id":"${id_inserted}",
    // "event":"watch",
    // "imported":${imported},
    // "inserted":${inserted},
    // "address":"${address}",
    // "unconfirmedCallbackURL":${cb0conf_url},
    // "confirmedCallbackURL":${cb1conf_url},
    // "estimatesmartfee2blocks":${fees2blocks},
    // "estimatesmartfee6blocks":${fees6blocks},
    // "estimatesmartfee36blocks":${fees36blocks},
    // "estimatesmartfee144blocks":${fees144blocks},
    // "eventMessage":${event_message}}"

    logger.info("CyphernodeClient.watch:", watchTO);

    let result: IRespWatch;
    const response = await this._post("/watch", watchTO);
    if (response.status >= 200 && response.status < 400) {
      result = { result: response.data };
    } else {
      result = {
        error: {
          code: ErrorCodes.InternalError,
          message: response.data.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as IResponseError<any>,
      } as IRespWatch;
    }
    return result;
  }

  async unwatch(watchId: number): Promise<IRespWatch> {
    // POST http://192.168.111.152:8080/unwatch
    // BODY {"address":"2N8DcqzfkYi8CkYzvNNS5amoq3SbAcQNXKp","unconfirmedCallbackURL":"192.168.111.233:1111/callback0conf","confirmedCallbackURL":"192.168.111.233:1111/callback1conf"}
    // or
    // BODY {"id":3124}

    // args:
    // - id, required, watch id
    //
    // unwatch response from Cyphernode:
    // {
    //   "event":"unwatch",
    //   "id":123
    // }
    logger.info("CyphernodeClient.unwatch:", watchId);

    let result: IRespWatch;
    const response = await this._post("/unwatch", { id: watchId });
    if (response.status >= 200 && response.status < 400) {
      result = { result: response.data };
    } else {
      result = {
        error: {
          code: ErrorCodes.InternalError,
          message: response.data.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as IResponseError<any>,
      } as IRespWatch;
    }
    return result;
  }

  async getNewWasabiAddress(
    reqNewWasabiAddress: IReqGetNewWasabiAddress
  ): Promise<IRespGetNewWasabiAddress> {
    // # queries random instance for a new bech32 address
    // # POST http://192.168.111.152:8080/wasabi_getnewaddress
    // # BODY {"label":"Pay #12 for 2018"}
    // # BODY {}
    // # Empty BODY: Label will be "unknown"

    // args:
    // - instanceId, optional, id of the instance where the new address will come from
    // - label, optional
    //
    // wasabi_getnewaddress response from Cyphernode:
    // {
    //   "address":"bc1,,,",
    //   "keyPath":"84'/0'/0'/0/29",
    //   "label":"MyLabel"
    // }

    logger.info("CyphernodeClient.getNewWasabiAddress:", reqNewWasabiAddress);

    let result: IRespGetNewWasabiAddress;
    const response = await this._post(
      "/wasabi_getnewaddress",
      reqNewWasabiAddress
    );
    if (response.status >= 200 && response.status < 400) {
      result = { result: response.data };
    } else {
      result = {
        error: {
          code: ErrorCodes.InternalError,
          message: response.data.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as IResponseError<any>,
      } as IRespGetNewWasabiAddress;
    }
    return result;
  }
}

export { CyphernodeClient };
