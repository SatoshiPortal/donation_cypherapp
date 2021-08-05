PRAGMA foreign_keys = ON;

CREATE TABLE beneficiary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT UNIQUE,
  description TEXT,
  email_address TEXT,
  phone_number TEXT,
  bitcoin_address TEXT,
  xpub TEXT,
  path TEXT,
  xpub_index INTEGER default 0,
  active INTEGER DEFAULT TRUE,
  created_ts INTEGER DEFAULT CURRENT_TIMESTAMP,
  updated_ts INTEGER DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE donation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_token TEXT UNIQUE,
  bitcoin_address TEXT,
  cn_watch_id INTEGER UNIQUE,
  bolt11 TEXT UNIQUE,
  lightning INTEGER DEFAULT FALSE,
  payment_details TEXT,
  paid_ts INTEGER,
  amount REAL,
  beneficiary_id INTEGER REFERENCES beneficiary,
  created_ts INTEGER DEFAULT CURRENT_TIMESTAMP,
  updated_ts INTEGER DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_donation_donation_token ON donation (donation_token);
CREATE INDEX idx_donation_btc_address ON donation (btc_address);
