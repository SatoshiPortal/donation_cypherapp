# donation_cypherapp

```bash
DOCKER_BUILDKIT=0 docker build -t donation .
take image before npm install
docker run --rm -it -v "$PWD:/donation" --entrypoint ash 96de22b8d843
npm install
```

```bash
docker run --rm -it --name lnurl -v "$PWD:/donation" -v "$PWD/cypherapps/data:/donation/data" -v "$PWD/cypherapps/data/logs:/donation/logs" --entrypoint ash donation
npm run build
npm run start
```

```bash
docker run --rm -it --name donation -v "$PWD:/donation" -v "$PWD/cypherapps/data:/donation/data" -v "$PWD/cypherapps/data/logs:/donation/logs" -v "/Users/kexkey/dev/cn-dev/dist/cyphernode/gatekeeper/certs/cert.pem:/donation/cert.pem:ro" --network cyphernodeappsnet -p 8000:8000 --entrypoint ash donation

npm run build
npm run start
```

-----

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

```bash
dexec donation apk add sqlite
dexec donation sqlite3 data/donation.sqlite "insert into beneficiary (label, description) values (\"olivier\", \"Olivier 'The Canadian Gangster' Aubin-Mercier\")"
dexec donation sqlite3 data/donation.sqlite -header "update beneficiary set xpub='vpub5SLqN2bLY4WeZF3kL4VqiWF1itbf3A6oRrq9aPf16AZMVWYCuN9TxpAZwCzVgW94TNzZPNc9XAHD4As6pdnExBtCDGYRmNJrcJ4eV9hNqcv',path='0' where label='olivier'"

```

## From a web browser

<http://localhost:8000/olivier>

## From an API client

### Create a donation

```bash
curl -d '{"id":0,"method":"createDonation","params":{"beneficiaryLabel":"olivier"}}' -H 'Content-Type: application/json' https://donate.bullbitcoin.dev/api | jq
{
  "id": 0,
  "result": {
    "donationToken": "6bcc7b54ae01b00fcf13c2d3151dd745",
    "bitcoinAddress": "tb1ql8trqycu6s7y9gwz2g9l3pcf00g4utq2vd9wgm",
    "bitcoinPaymentDetails": "",
    "bitcoinPaidTimestamp": null,
    "bitcoinAmount": null,
    "bolt11": "lntb1psseytmpp506rxqu9mean5zwdwuzsfv7u7hca4sg2m0kxnp23hdx0cq49zaqtqdrh235xzmntwvsxvmmjypuk7atjypjx7mnpw35k7m3qw3hjqnmvd9mxjetjyqn4g6r9yppkzmnpv35kzm3qgaskuemnw3jhyfeqg96ky6tw94xk2unrd9jhyggxqyjw5qcqp2sp5tajp88nx52n782c29a04fkw2evu97u7ajvvsamwerkutxlcytugqrzjqw0wfcap6ap4kwv64khnuztdm7z7tutafndyfy093xu6jkguzut3x85c95qqq9sqqyqqqqlgqqqqqqgq9q9qy9qsq82twppuakuwhaty4h4crr6gmgalgep4fkw35aqpp5ltr3m6tcdk336la4ggzu0lag9jc96sryuvdsezqtx3mysynfhpn4m8gt2wjugsptf6w9j",
    "lnPaymentDetails": null,
    "lnPaidTimestamp": null,
    "lnMsatoshi": null,
    "beneficiaryDescription": "Olivier The Canadian Gangster Aubin-Mercier"
  }
}
```

### Let's see it

```bash
curl -d '{"id":0,"method":"getDonation","params":{"beneficiary":"olivier","donationToken":"6bcc7b54ae01b00fcf13c2d3151dd745"}}' -H 'Content-Type: application/json' https://donate.bullbitcoin.dev/api | jq
{
  "id": 0,
  "result": {
    "donationToken": "6bcc7b54ae01b00fcf13c2d3151dd745",
    "bitcoinAddress": "tb1ql8trqycu6s7y9gwz2g9l3pcf00g4utq2vd9wgm",
    "bitcoinPaymentDetails": "",
    "bitcoinPaidTimestamp": null,
    "bitcoinAmount": null,
    "bolt11": "lntb1psseytmpp506rxqu9mean5zwdwuzsfv7u7hca4sg2m0kxnp23hdx0cq49zaqtqdrh235xzmntwvsxvmmjypuk7atjypjx7mnpw35k7m3qw3hjqnmvd9mxjetjyqn4g6r9yppkzmnpv35kzm3qgaskuemnw3jhyfeqg96ky6tw94xk2unrd9jhyggxqyjw5qcqp2sp5tajp88nx52n782c29a04fkw2evu97u7ajvvsamwerkutxlcytugqrzjqw0wfcap6ap4kwv64khnuztdm7z7tutafndyfy093xu6jkguzut3x85c95qqq9sqqyqqqqlgqqqqqqgq9q9qy9qsq82twppuakuwhaty4h4crr6gmgalgep4fkw35aqpp5ltr3m6tcdk336la4ggzu0lag9jc96sryuvdsezqtx3mysynfhpn4m8gt2wjugsptf6w9j",
    "lnPaymentDetails": null,
    "lnPaidTimestamp": null,
    "lnMsatoshi": null,
    "beneficiaryDescription": "Olivier 'The Canadian Gangster' Aubin-Mercier"
  }
}
```

### Paid using LN

```bash
curl -d '{"id":0,"method":"getDonation","params":{"beneficiary":"olivier","donationToken":"6bcc7b54ae01b00fcf13c2d3151dd745"}}' -H 'Content-Type: application/json' https://donate.bullbitcoin.dev/api | jq
{
  "id": 0,
  "result": {
    "donationToken": "6bcc7b54ae01b00fcf13c2d3151dd745",
    "bitcoinAddress": "tb1ql8trqycu6s7y9gwz2g9l3pcf00g4utq2vd9wgm",
    "bitcoinPaymentDetails": "",
    "bitcoinPaidTimestamp": null,
    "bitcoinAmount": null,
    "bolt11": "lntb1psseytmpp506rxqu9mean5zwdwuzsfv7u7hca4sg2m0kxnp23hdx0cq49zaqtqdrh235xzmntwvsxvmmjypuk7atjypjx7mnpw35k7m3qw3hjqnmvd9mxjetjyqn4g6r9yppkzmnpv35kzm3qgaskuemnw3jhyfeqg96ky6tw94xk2unrd9jhyggxqyjw5qcqp2sp5tajp88nx52n782c29a04fkw2evu97u7ajvvsamwerkutxlcytugqrzjqw0wfcap6ap4kwv64khnuztdm7z7tutafndyfy093xu6jkguzut3x85c95qqq9sqqyqqqqlgqqqqqqgq9q9qy9qsq82twppuakuwhaty4h4crr6gmgalgep4fkw35aqpp5ltr3m6tcdk336la4ggzu0lag9jc96sryuvdsezqtx3mysynfhpn4m8gt2wjugsptf6w9j",
    "lnPaymentDetails": "{\"id\":\"536\",\"label\":\"donation-olivier-6bcc7b54ae01b00fcf13c2d3151dd745\",\"bolt11\":\"lntb1psseytmpp506rxqu9mean5zwdwuzsfv7u7hca4sg2m0kxnp23hdx0cq49zaqtqdrh235xzmntwvsxvmmjypuk7atjypjx7mnpw35k7m3qw3hjqnmvd9mxjetjyqn4g6r9yppkzmnpv35kzm3qgaskuemnw3jhyfeqg96ky6tw94xk2unrd9jhyggxqyjw5qcqp2sp5tajp88nx52n782c29a04fkw2evu97u7ajvvsamwerkutxlcytugqrzjqw0wfcap6ap4kwv64khnuztdm7z7tutafndyfy093xu6jkguzut3x85c95qqq9sqqyqqqqlgqqqqqqgq9q9qy9qsq82twppuakuwhaty4h4crr6gmgalgep4fkw35aqpp5ltr3m6tcdk336la4ggzu0lag9jc96sryuvdsezqtx3mysynfhpn4m8gt2wjugsptf6w9j\",\"callback_url\":\"http://donation:8000/webhooks/6bcc7b54ae01b00fcf13c2d3151dd745\",\"payment_hash\":\"7e866070bbcf674139aee0a0967b9ebe3b58215b7d8d30aa37699f8054a2e816\",\"status\":\"paid\",\"pay_index\":30,\"msatoshi_received\":123451000,\"paid_at\":1628213709,\"description\":\"Thanks for your donation to Olivier 'The Canadian Gangster' Aubin-Mercier!\",\"expires_at\":1628818427}",
    "lnPaidTimestamp": "2021-08-06T01:35:10.306Z",
    "lnMsatoshi": 123451000,
    "beneficiaryDescription": "Olivier 'The Canadian Gangster' Aubin-Mercier"
  }
}
```

### Paid using on-chain Bitcoin

```bash
curl -d '{"id":0,"method":"getDonation","params":{"beneficiary":"olivier","donationToken":"6bcc7b54ae01b00fcf13c2d3151dd745"}}' -H 'Content-Type: application/json' https://donate.bullbitcoin.dev/api | jq
{
  "id": 0,
  "result": {
    "donationToken": "6bcc7b54ae01b00fcf13c2d3151dd745",
    "bitcoinAddress": "tb1ql8trqycu6s7y9gwz2g9l3pcf00g4utq2vd9wgm",
    "bitcoinPaymentDetails": "{\"id\":\"993\",\"address\":\"tb1ql8trqycu6s7y9gwz2g9l3pcf00g4utq2vd9wgm\",\"txid\":\"2d8b8d3800d2238817f8650d8f534badd557eab883a1c24da469ab6631fed573\",\"hash\":\"4f4d1dab63de773c73cafb24a0b1a78768ad7cb7b739ff96c384e34e364ce6e4\",\"vout_n\":0,\"sent_amount\":0.00001,\"confirmations\":0,\"received\":\"2021-08-06T01:35:48+0000\",\"size\":222,\"vsize\":141,\"fees\":0.00000141,\"replaceable\":true,\"eventMessage\":\"\"}",
    "bitcoinPaidTimestamp": "2021-08-06T01:35:50.189Z",
    "bitcoinAmount": 1e-05,
    "bolt11": "lntb1psseytmpp506rxqu9mean5zwdwuzsfv7u7hca4sg2m0kxnp23hdx0cq49zaqtqdrh235xzmntwvsxvmmjypuk7atjypjx7mnpw35k7m3qw3hjqnmvd9mxjetjyqn4g6r9yppkzmnpv35kzm3qgaskuemnw3jhyfeqg96ky6tw94xk2unrd9jhyggxqyjw5qcqp2sp5tajp88nx52n782c29a04fkw2evu97u7ajvvsamwerkutxlcytugqrzjqw0wfcap6ap4kwv64khnuztdm7z7tutafndyfy093xu6jkguzut3x85c95qqq9sqqyqqqqlgqqqqqqgq9q9qy9qsq82twppuakuwhaty4h4crr6gmgalgep4fkw35aqpp5ltr3m6tcdk336la4ggzu0lag9jc96sryuvdsezqtx3mysynfhpn4m8gt2wjugsptf6w9j",
    "lnPaymentDetails": "{\"id\":\"536\",\"label\":\"donation-olivier-6bcc7b54ae01b00fcf13c2d3151dd745\",\"bolt11\":\"lntb1psseytmpp506rxqu9mean5zwdwuzsfv7u7hca4sg2m0kxnp23hdx0cq49zaqtqdrh235xzmntwvsxvmmjypuk7atjypjx7mnpw35k7m3qw3hjqnmvd9mxjetjyqn4g6r9yppkzmnpv35kzm3qgaskuemnw3jhyfeqg96ky6tw94xk2unrd9jhyggxqyjw5qcqp2sp5tajp88nx52n782c29a04fkw2evu97u7ajvvsamwerkutxlcytugqrzjqw0wfcap6ap4kwv64khnuztdm7z7tutafndyfy093xu6jkguzut3x85c95qqq9sqqyqqqqlgqqqqqqgq9q9qy9qsq82twppuakuwhaty4h4crr6gmgalgep4fkw35aqpp5ltr3m6tcdk336la4ggzu0lag9jc96sryuvdsezqtx3mysynfhpn4m8gt2wjugsptf6w9j\",\"callback_url\":\"http://donation:8000/webhooks/6bcc7b54ae01b00fcf13c2d3151dd745\",\"payment_hash\":\"7e866070bbcf674139aee0a0967b9ebe3b58215b7d8d30aa37699f8054a2e816\",\"status\":\"paid\",\"pay_index\":30,\"msatoshi_received\":123451000,\"paid_at\":1628213709,\"description\":\"Thanks for your donation to Olivier 'The Canadian Gangster' Aubin-Mercier!\",\"expires_at\":1628818427}",
    "lnPaidTimestamp": "2021-08-06T01:35:10.306Z",
    "lnMsatoshi": 123451000,
    "beneficiaryDescription": "Olivier 'The Canadian Gangster' Aubin-Mercier"
  }
}
```

dexec lightning lightning-cli --lightning-dir=/.lightning listinvoices | jq -Mc '.invoices | map(select((.label | startswith("donation-olivier-")) and .status == "paid"))'
dexec lightning lightning-cli --lightning-dir=/.lightning listinvoices | jq -Mc '.invoices | map(select((.label | startswith("donation-olivier-")) and .status == "paid")) | [.[].msatoshi_received] | add'

curl -d '{"id":0,"method":"reloadConfig"}' -H 'Content-Type: application/json' localhost:8000/api
