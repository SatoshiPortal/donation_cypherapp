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

sqlite3 data/donation.sqlite 'insert into beneficiary (label, description) values ("olivier", "Olivier \'The Canadian Gangster\' Aubin-Mercier")'

## From a web browser

<http://localhost:8000/olivier>

## From an API client

### Create a donation

curl -d '{"id":0,"method":"createDonation","params":{"beneficiaryLabel":"olivier"}}' -H 'Content-Type: application/json' localhost:8000/api
{"id":0,"result":{"donationToken":"eb39b286c0a59619a4114c51da637c81e45e27185d89259bda83d4480b281dcf","bitcoinAddress":"bcrt1qmk46feqlhv2906grwf94kuvahmhf508d446zs9","bolt11":"lnbcrt1psscdz8pp5dp856g9mda0xrf0cdxy470tcygenqm4u8ng335hsks9qkx5ypvwqdzy235xzmntwvsxvmmjypuk7atjypjx7mnpw35k7m3qw3hjqnmvd9mxjetjypqh2cnfdcssxqyjw5qcqp2sp5hjrjtxg6n6n2gr0rtjcs7ve655sfhfcmwppcnj46dfhjwdg25u8s9qy9qsqaqpvm99t20j9305f4wyuntjv2txv32eqrtelqyqy6cmfmavqpzj4uhzpqej5rcsjsz4vku3d884c4jdngg2mgux8h0fvxv9sw9kka4squm48mt","lightning":false,"paymentDetails":null,"amount":null,"paidTimestamp":null,"beneficiaryDescription":"Olivier Aubin"}}

### Paid using LN

curl -d '{"id":0,"method":"getDonation","params":{"beneficiary":"olivier","donationToken":"eb39b286c0a59619a4114c51da637c81e45e27185d89259bda83d4480b281dcf"}}' -H 'Content-Type: application/json' localhost:8000/api
{"id":0,"result":{"donationToken":"eb39b286c0a59619a4114c51da637c81e45e27185d89259bda83d4480b281dcf","bitcoinAddress":"bcrt1qmk46feqlhv2906grwf94kuvahmhf508d446zs9","bolt11":"lnbcrt1psscdz8pp5dp856g9mda0xrf0cdxy470tcygenqm4u8ng335hsks9qkx5ypvwqdzy235xzmntwvsxvmmjypuk7atjypjx7mnpw35k7m3qw3hjqnmvd9mxjetjypqh2cnfdcssxqyjw5qcqp2sp5hjrjtxg6n6n2gr0rtjcs7ve655sfhfcmwppcnj46dfhjwdg25u8s9qy9qsqaqpvm99t20j9305f4wyuntjv2txv32eqrtelqyqy6cmfmavqpzj4uhzpqej5rcsjsz4vku3d884c4jdngg2mgux8h0fvxv9sw9kka4squm48mt","lightning":true,"paymentDetails":"{\"id\":\"68\",\"label\":\"donation-olivier-eb39b286c0a59619a4114c51da637c81e45e27185d89259bda83d4480b281dcf\",\"bolt11\":\"lnbcrt1psscdz8pp5dp856g9mda0xrf0cdxy470tcygenqm4u8ng335hsks9qkx5ypvwqdzy235xzmntwvsxvmmjypuk7atjypjx7mnpw35k7m3qw3hjqnmvd9mxjetjypqh2cnfdcssxqyjw5qcqp2sp5hjrjtxg6n6n2gr0rtjcs7ve655sfhfcmwppcnj46dfhjwdg25u8s9qy9qsqaqpvm99t20j9305f4wyuntjv2txv32eqrtelqyqy6cmfmavqpzj4uhzpqej5rcsjsz4vku3d884c4jdngg2mgux8h0fvxv9sw9kka4squm48mt\",\"callback_url\":\"http://donation:8000/webhooks/eb39b286c0a59619a4114c51da637c81e45e27185d89259bda83d4480b281dcf\",\"payment_hash\":\"684f4d20bb6f5e61a5f869895f3d782233306ebc3cd118d2f0b40a0b1a840b1c\",\"status\":\"paid\",\"pay_index\":26,\"msatoshi_received\":123123,\"paid_at\":1628189814,\"description\":\"Thanks for your donation to Olivier Aubin!\",\"expires_at\":1628794567}","amount":123123,"paidTimestamp":"2021-08-05T18:56:55.657Z","beneficiaryDescription":"Olivier Aubin"}}

### Create another donation

curl -d '{"id":0,"method":"createDonation","params":{"beneficiaryLabel":"olivier"}}' -H 'Content-Type: application/json' localhost:8000/api
{"id":0,"result":{"donationToken":"c179d44333287047dfc7e4b1145f9ce25d35618814941aa658559bc162bcbe3c","bitcoinAddress":"bcrt1qvln7h98tpn3l0fr4hpy96n37ssqnr0tj24qpvs","bolt11":"lnbcrt1psscd9qpp5f0cl6jc6f0jq7l9gsctlljllzswephc8ped0wfqmenukn6w6yfmsdzy235xzmntwvsxvmmjypuk7atjypjx7mnpw35k7m3qw3hjqnmvd9mxjetjypqh2cnfdcssxqyjw5qcqp2sp5cq73c9kad3ezmaf3p8z2vjv98m85apugmty5htqh5cqx7g0mvt9s9qy9qsqj7v7kg8ugxn3xqfy35p027hvmwky9p73yw6lrpk890ppldmq2nl9lqq99yfs3wvswalteqplh2fvwgszp2m9s2ckmnjw080mk7u0r4qpncwtmp","lightning":false,"paymentDetails":null,"amount":null,"paidTimestamp":null,"beneficiaryDescription":"Olivier Aubin"}}

### Paid using on-chain Bitcoin

curl -d '{"id":0,"method":"getDonation","params":{"beneficiary":"olivier","donationToken":"c179d44333287047dfc7e4b1145f9ce25d35618814941aa658559bc162bcbe3c"}}' -H 'Content-Type: application/json' localhost:8000/api
{"id":0,"result":{"donationToken":"c179d44333287047dfc7e4b1145f9ce25d35618814941aa658559bc162bcbe3c","bitcoinAddress":"bcrt1qvln7h98tpn3l0fr4hpy96n37ssqnr0tj24qpvs","bolt11":"lnbcrt1psscd9qpp5f0cl6jc6f0jq7l9gsctlljllzswephc8ped0wfqmenukn6w6yfmsdzy235xzmntwvsxvmmjypuk7atjypjx7mnpw35k7m3qw3hjqnmvd9mxjetjypqh2cnfdcssxqyjw5qcqp2sp5cq73c9kad3ezmaf3p8z2vjv98m85apugmty5htqh5cqx7g0mvt9s9qy9qsqj7v7kg8ugxn3xqfy35p027hvmwky9p73yw6lrpk890ppldmq2nl9lqq99yfs3wvswalteqplh2fvwgszp2m9s2ckmnjw080mk7u0r4qpncwtmp","lightning":false,"paymentDetails":"{\"id\":\"11\",\"address\":\"bcrt1qvln7h98tpn3l0fr4hpy96n37ssqnr0tj24qpvs\",\"txid\":\"32b7bcf17f28bcf73cf6099ac7bf91dbef6bbbf8a44beed1613dc45a9eac02a0\",\"hash\":\"426e9898d375931bc8e98749e3ee180a937afe1e347c310c5a36d3dd2575de60\",\"vout_n\":0,\"sent_amount\":0.00023,\"confirmations\":0,\"received\":\"2021-08-05T18:58:05+0000\",\"size\":222,\"vsize\":141,\"fees\":0.0000282,\"replaceable\":true,\"eventMessage\":\"\"}","amount":0.00023,"paidTimestamp":"2021-08-05T18:58:07.932Z","beneficiaryDescription":"Olivier Aubin"}}
