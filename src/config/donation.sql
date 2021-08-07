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
  use_xpub INTEGER DEFAULT TRUE,
  active INTEGER DEFAULT TRUE,
  created_ts INTEGER DEFAULT CURRENT_TIMESTAMP,
  updated_ts INTEGER DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE donation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_token TEXT UNIQUE,
  bitcoin_address TEXT,
  bitcoin_payment_details TEXT,
  bitcoin_paid_ts INTEGER,
  bitcoin_amount REAL,
  cn_watch_id INTEGER,
  bolt11 TEXT UNIQUE,
  ln_payment_details TEXT,
  ln_paid_ts INTEGER,
  ln_msatoshi INTEGER,
  beneficiary_id INTEGER REFERENCES beneficiary,
  created_ts INTEGER DEFAULT CURRENT_TIMESTAMP,
  updated_ts INTEGER DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_donation_donation_token ON donation (donation_token);
CREATE INDEX idx_donation_btc_address ON donation (btc_address);
