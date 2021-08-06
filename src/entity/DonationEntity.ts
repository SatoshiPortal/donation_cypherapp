import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { BeneficiaryEntity } from "./BeneficiaryEntity";

// CREATE TABLE donation (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   donation_token TEXT UNIQUE,
//   bitcoin_address TEXT,
//   bitcoin_payment_details TEXT,
//   bitcoin_paid_ts INTEGER,
//   bitcoin_amount REAL,
//   cn_watch_id INTEGER UNIQUE,
//   bolt11 TEXT UNIQUE,
//   ln_payment_details TEXT,
//   ln_paid_ts INTEGER,
//   ln_msatoshi INTEGER,
//   beneficiary_id INTEGER REFERENCES beneficiary,
//   created_ts INTEGER DEFAULT CURRENT_TIMESTAMP,
//   updated_ts INTEGER DEFAULT CURRENT_TIMESTAMP
// );
// CREATE INDEX idx_donation_donation_token ON donation (donation_token);
// CREATE INDEX idx_donation_btc_address ON donation (btc_address);

@Entity("donation")
export class DonationEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  donationId!: number;

  @Index("idx_donation_donation_token")
  @Column({ type: "text", name: "donation_token", unique: true })
  donationToken!: string;

  @Index("idx_donation_btc_address")
  @Column({ type: "text", name: "bitcoin_address", nullable: true })
  bitcoinAddress?: string;

  @Column({ type: "text", name: "bitcoin_payment_details", nullable: true })
  bitcoinPaymentDetails?: string;

  @Column({ type: "integer", name: "bitcoin_paid_ts", nullable: true })
  bitcoinPaidTimestamp?: Date;

  @Column({ type: "real", name: "bitcoin_amount", nullable: true })
  bitcoinAmount?: number;

  @Column({ type: "integer", name: "cn_watch_id", unique: true })
  cnWatchId?: number;

  @Column({ type: "text", name: "bolt11", unique: true, nullable: true })
  bolt11?: string;

  @Column({ type: "text", name: "ln_payment_details", nullable: true })
  lnPaymentDetails?: string;

  @Column({ type: "real", name: "ln_msatoshi", nullable: true })
  lnMsatoshi?: number;

  @Column({ type: "integer", name: "ln_paid_ts", nullable: true })
  lnPaidTimestamp?: Date;

  @ManyToOne(() => BeneficiaryEntity, (beneficiary) => beneficiary.donations)
  @JoinColumn({ name: "beneficiary_id" })
  beneficiary!: BeneficiaryEntity;

  @CreateDateColumn({ type: "integer", name: "created_ts" })
  createdAt?: Date;

  @UpdateDateColumn({ type: "integer", name: "updated_ts" })
  updatedAt?: Date;
}
