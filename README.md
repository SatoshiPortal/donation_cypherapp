# donation_cypherapp

DOCKER_BUILDKIT=0 docker build -t donation .
take image before npm install
docker run --rm -it -v "$PWD:/donation" --entrypoint ash 96de22b8d843
npm install

docker run --rm -it --name lnurl -v "$PWD:/donation" -v "$PWD/cypherapps/data:/donation/data" -v "$PWD/cypherapps/data/logs:/donation/logs" --entrypoint ash donation
npm run build
npm run start

docker run --rm -it --name donation -v "$PWD:/donation" -v "$PWD/cypherapps/data:/donation/data" -v "$PWD/cypherapps/data/logs:/donation/logs" -v "/Users/kexkey/dev/cn-dev/dist/cyphernode/gatekeeper/certs/cert.pem:/donation/cert.pem:ro" --network cyphernodeappsnet -p 8000:8000 --entrypoint ash donation

npm run build
npm run start

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

insert into beneficiary (label, description) values ("olivier", "Olivier Aubin")

## From a web browser

<http://localhost:8000/olivier>

## From an API client

### Create a donation

curl -d '{"id":0,"method":"createDonation","params":{"beneficiaryLabel":"olivier"}}' -H 'Content-Type: application/json' localhost:8000/api
{"id":0,"result":{"donationToken":"421756380564","bolt11":"lnbcrt1psscg00pp5r02as0mwuad8hp2px42tedp8j6m09e96g3srgzl0uk4er78tp5cqdzy235xzmntwvsxvmmjypuk7atjypjx7mnpw35k7m3qw3hjqnmvd9mxjetjypqh2cnfdcssxqyjw5qcqp2sp5r9smfq9n0njcmjvk64rxqanz9gns8cwm90dkjge73a4f46swwl4q9qy9qsqc5nymvcjnrhqz2r657tmcyfxcz57taprlcs6fl4adcyclayyw8kz4k2xz4fp6hkclr9wxrnapuq26rnhg5ej48cmxp2z5z9att6md9sqku4s4t","bitcoinAddress":"bcrt1q3vn2t24thx83qs66yzp3x8xcu8tmq2c2dn2jg8","cnWatchId":"6","beneficiary":{"beneficiaryId":1,"label":"olivier","description":"Olivier Aubin","emailAddress":null,"phoneNumber":null,"bitcoinAddress":null,"xpub":null,"path":null,"xpubIndex":0,"active":true,"createdAt":"2021-08-05 16:15:24","updatedAt":"2021-08-05 16:15:24"},"lightning":false,"paymentDetails":null,"amount":null,"paidTimestamp":null,"donationId":6,"createdAt":"2021-08-05 17:37:53","updatedAt":"2021-08-05 17:37:53"}}

### Paid using LN

curl -d '{"id":0,"method":"getDonation","params":{"beneficiary":"olivier","donationToken":"421756380564"}}' -H 'Content-Type: application/json' localhost:8000/api
{"id":0,"result":{"donationId":6,"donationToken":"421756380564","bitcoinAddress":"bcrt1q3vn2t24thx83qs66yzp3x8xcu8tmq2c2dn2jg8","cnWatchId":6,"bolt11":"lnbcrt1psscg00pp5r02as0mwuad8hp2px42tedp8j6m09e96g3srgzl0uk4er78tp5cqdzy235xzmntwvsxvmmjypuk7atjypjx7mnpw35k7m3qw3hjqnmvd9mxjetjypqh2cnfdcssxqyjw5qcqp2sp5r9smfq9n0njcmjvk64rxqanz9gns8cwm90dkjge73a4f46swwl4q9qy9qsqc5nymvcjnrhqz2r657tmcyfxcz57taprlcs6fl4adcyclayyw8kz4k2xz4fp6hkclr9wxrnapuq26rnhg5ej48cmxp2z5z9att6md9sqku4s4t","lightning":false,"paymentDetails":null,"amount":null,"paidTimestamp":null,"createdAt":"2021-08-05 17:37:53","updatedAt":"2021-08-05 17:37:53"}}

### Create another donation

curl -d '{"id":0,"method":"createDonation","params":{"beneficiaryLabel":"olivier"}}' -H 'Content-Type: application/json' localhost:8000/api
{"id":0,"result":{"donationToken":"127b5cc5c091cc70ce82f1d0cd6d976aa480fe9be3602dec6a115825fa3480ad","bolt11":"lnbcrt1pssc2grpp5adp5qhyenuarlnlhl46guw9fzl3hsz5fn4u2hr6c3wvqas4zgp2sdzy235xzmntwvsxvmmjypuk7atjypjx7mnpw35k7m3qw3hjqnmvd9mxjetjypqh2cnfdcssxqyjw5qcqp2sp5pk42nwn8rcdgzqjw7s29ezec8q3vq3pwuly6fxru4vnq6wjky5ws9qy9qsqdnu8w0hhu0wk3prsujwc4g6ze03dhjvz33d9asf5avv784nf2sa4pdqjpp2lj8x2qzcnx3pz4erfwhlmkhwfs73yewnqkcayk47rthgp7vugny","bitcoinAddress":"bcrt1qpkuserdavu89hpgqxv7fp2u2adylmy4sc3ca2a","cnWatchId":"8","beneficiary":{"beneficiaryId":1,"label":"olivier","description":"Olivier Aubin","emailAddress":null,"phoneNumber":null,"bitcoinAddress":null,"xpub":null,"path":null,"xpubIndex":0,"active":true,"createdAt":"2021-08-05 16:15:24","updatedAt":"2021-08-05 16:15:24"},"lightning":false,"paymentDetails":null,"amount":null,"paidTimestamp":null,"donationId":8,"createdAt":"2021-08-05 18:08:05","updatedAt":"2021-08-05 18:08:05"}}

### Paid using on-chain Bitcoin

{"id":0,"result":{"donationId":8,"donationToken":"127b5cc5c091cc70ce82f1d0cd6d976aa480fe9be3602dec6a115825fa3480ad","bitcoinAddress":"bcrt1qpkuserdavu89hpgqxv7fp2u2adylmy4sc3ca2a","cnWatchId":8,"bolt11":"lnbcrt1pssc2grpp5adp5qhyenuarlnlhl46guw9fzl3hsz5fn4u2hr6c3wvqas4zgp2sdzy235xzmntwvsxvmmjypuk7atjypjx7mnpw35k7m3qw3hjqnmvd9mxjetjypqh2cnfdcssxqyjw5qcqp2sp5pk42nwn8rcdgzqjw7s29ezec8q3vq3pwuly6fxru4vnq6wjky5ws9qy9qsqdnu8w0hhu0wk3prsujwc4g6ze03dhjvz33d9asf5avv784nf2sa4pdqjpp2lj8x2qzcnx3pz4erfwhlmkhwfs73yewnqkcayk47rthgp7vugny","lightning":false,"paymentDetails":"{\"id\":\"8\",\"address\":\"bcrt1qpkuserdavu89hpgqxv7fp2u2adylmy4sc3ca2a\",\"txid\":\"413c29b41741ade6c4355984c8a6e53675f4f58e1d7ff1b56c2f4914ee222479\",\"hash\":\"935198386cd12eb4097fb33702d8b8fc4c769e56baee39c63cbe161b85e64b97\",\"vout_n\":0,\"sent_amount\":0.00023,\"confirmations\":1,\"received\":\"2021-08-05T18:14:52+0000\",\"size\":222,\"vsize\":141,\"fees\":0.0000282,\"replaceable\":true,\"blockhash\":\"788201667e18925649078ea3e5361803adf12170a1a87ea06c837613dc25ef9b\",\"blocktime\":\"2021-08-05T18:15:36+0000\",\"blockheight\":303,\"eventMessage\":\"\"}","amount":0.00023,"paidTimestamp":"2021-08-05T18:15:38.148Z","createdAt":"2021-08-05 18:08:05","updatedAt":"2021-08-05 18:15:38","beneficiary":{"beneficiaryId":1,"label":"olivier","description":"Olivier Aubin","emailAddress":null,"phoneNumber":null,"bitcoinAddress":null,"xpub":null,"path":null,"xpubIndex":0,"active":1,"createdAt":"2021-08-05 16:15:24","updatedAt":"2021-08-05 16:15:24"}}}
