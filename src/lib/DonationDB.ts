import logger from "./Log2File";
import path from "path";
import DonationConfig from "../config/DonationConfig";
import { Connection, createConnection } from "typeorm";
import { DonationEntity } from "../entity/DonationEntity";
import { BeneficiaryEntity } from "../entity/BeneficiaryEntity";

class DonationDB {
  private _db?: Connection;

  constructor(donationConfig: DonationConfig) {
    this.configureDB(donationConfig);
  }

  async configureDB(donationConfig: DonationConfig): Promise<void> {
    logger.info("DonationDB.configureDB", donationConfig);

    if (this._db?.isConnected) {
      await this._db.close();
    }
    this._db = await this.initDatabase(
      path.resolve(
        donationConfig.BASE_DIR,
        donationConfig.DATA_DIR,
        donationConfig.DB_NAME
      )
    );
  }

  async initDatabase(dbName: string): Promise<Connection> {
    logger.info("DonationDB.initDatabase", dbName);

    return await createConnection({
      type: "sqlite",
      database: dbName,
      entities: [BeneficiaryEntity, DonationEntity],
      synchronize: true,
      logging: true,
    });
  }

  async saveDonation(donation: DonationEntity): Promise<DonationEntity> {
    const d = await this._db?.manager
      .getRepository(DonationEntity)
      .save(donation);

    // We need to instantiate a new Date with expiration:
    // https://github.com/typeorm/typeorm/issues/4320
    if (d) {
      if (d.paidTimestamp) d.paidTimestamp = new Date(d.paidTimestamp);
      d.lightning = ((d.lightning as unknown) as number) == 1;
    }

    return d as DonationEntity;
  }

  async getDonationByToken(donationToken: string): Promise<DonationEntity> {
    const d = await this._db?.manager
      .getRepository(DonationEntity)
      .findOne({ donationToken }, { relations: ["beneficiary"] });

    // We need to instantiate a new Date with expiration:
    // https://github.com/typeorm/typeorm/issues/4320
    if (d) {
      if (d.paidTimestamp) d.paidTimestamp = new Date(d.paidTimestamp);
      d.lightning = ((d.lightning as unknown) as number) == 1;
    }

    return d as DonationEntity;
  }

  async getDonation(donationEntity: DonationEntity): Promise<DonationEntity> {
    const d = await this._db?.manager
      .getRepository(DonationEntity)
      .findOne(donationEntity);

    // We need to instantiate a new Date with expiration:
    // https://github.com/typeorm/typeorm/issues/4320
    if (d) {
      if (d.paidTimestamp) d.paidTimestamp = new Date(d.paidTimestamp);
      d.lightning = ((d.lightning as unknown) as number) == 1;
    }

    return d as DonationEntity;
  }

  async getDonationById(donationId: number): Promise<DonationEntity> {
    const d = await this._db?.manager
      .getRepository(DonationEntity)
      .findOne(donationId);

    // We need to instantiate a new Date with expiration:
    // https://github.com/typeorm/typeorm/issues/4320
    if (d) {
      if (d.paidTimestamp) d.paidTimestamp = new Date(d.paidTimestamp);
      d.lightning = ((d.lightning as unknown) as number) == 1;
    }

    return d as DonationEntity;
  }

  async getBeneficiaryByLabel(label: string): Promise<BeneficiaryEntity> {
    const b = await this._db?.manager
      .getRepository(BeneficiaryEntity)
      .findOne({ where: { label } });

    // We need to instantiate a new Date with expiration:
    // https://github.com/typeorm/typeorm/issues/4320
    if (b) {
      b.active = ((b.active as unknown) as number) == 1;
    }

    return b as BeneficiaryEntity;
  }
}

export { DonationDB };
