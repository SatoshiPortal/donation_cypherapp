export default interface DonationConfig {
  LOG: string;
  BASE_DIR: string;
  DATA_DIR: string;
  DB_NAME: string;
  URL_API_SERVER: string;
  URL_API_PORT: number;
  URL_API_CTX: string;
  URL_CTX_WEBHOOKS: string;
  SESSION_TIMEOUT: number;
  CN_URL: string;
  CN_API_ID: string;
  CN_API_KEY: string;
  DONATION_BENEFICIARY_LABEL: string;
  DONATION_BENEFICIARY_DESCRIPTION: string;
  STATIC_BITCOIN_ADDRESS: boolean;
  DONATION_BITCOIN_ADDRESS: string;
}
