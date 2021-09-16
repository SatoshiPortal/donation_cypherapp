import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { DonationEntity } from "./DonationEntity";

// CREATE TABLE beneficiary (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   label TEXT UNIQUE,
//   description TEXT,
//   email_address TEXT,
//   phone_number TEXT,
//   bitcoin_address TEXT,
//   xpub TEXT,
//   path TEXT,
//   xpub_index INTEGER default 0,
//   use_xpub INTEGER DEFAULT FALSE,
//   use_wasabi INTEGER DEFAULT FALSE,
//   active INTEGER DEFAULT TRUE,
//   created_ts INTEGER DEFAULT CURRENT_TIMESTAMP,
//   updated_ts INTEGER DEFAULT CURRENT_TIMESTAMP
// );

@Entity("beneficiary")
export class BeneficiaryEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  beneficiaryId!: number;

  @Column({ type: "text", name: "label", unique: true })
  label!: string;

  @Column({ type: "text", name: "description", nullable: true })
  description?: string;

  @Column({ type: "text", name: "email_address", nullable: true })
  emailAddress?: string;

  @Column({ type: "text", name: "phone_number", nullable: true })
  phoneNumber?: string;

  @Column({ type: "text", name: "bitcoin_address", nullable: true })
  bitcoinAddress?: string;

  @Column({ type: "text", name: "xpub", nullable: true })
  xpub?: string;

  @Column({ type: "text", name: "path", nullable: true })
  path?: string;

  @Column({ type: "integer", name: "xpub_index", default: 0 })
  xpubIndex?: number;

  @Column({ type: "integer", name: "use_xpub", default: false })
  useXpub?: boolean;

  @Column({ type: "integer", name: "use_wasabi", default: false })
  useWasabi?: boolean;

  @Column({ type: "integer", name: "active", nullable: true, default: true })
  active?: boolean;

  @OneToMany(() => DonationEntity, (donation) => donation.beneficiary)
  donations!: DonationEntity[];

  @CreateDateColumn({ type: "integer", name: "created_ts" })
  createdAt?: number;

  @UpdateDateColumn({ type: "integer", name: "updated_ts" })
  updatedAt?: number;
}
