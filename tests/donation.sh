#!/bin/sh

# Happy path:
#
# 1. Create a new beneficiary
# 2. Get it, compare
# 3. Update beneficiary
# 4. Get it, compare
#
# 5. Create a donation
# 6. Get it, compare
# 7. Update the donation with LN
# 8. Get it, compare
#
# 9. Make a LN payment
# 10. Get donation, make sure LN payment in
#
# 11. Create a donation
# 12. Make an on-chain payment
# 13. Get donation, make sure Bitcoin payment in
#
#
# Test inexistent:
#
# 1. Try to get inexistent beneficiary
# 2. Try to update inexistent beneficiary
#
# 
# Donate to inactive beneficiary:
#
# 1. Create a new beneficiary
# 2. Update it with active=false
# 3. Create a donation and make sure it fails
#
#

. ./tests/colors.sh

trace() {
  if [ "${1}" -le "${TRACING}" ]; then
    local str="$(date -Is) $$ ${2}"
    echo -e "${str}" >&2
  fi
}

generate_random_beneficiary() {
  trace 2 "\n\n[generate_random_beneficiary] ${BCyan}Generating random beneficiary...${Color_Off}\n"

  # beneficiaryId?: number;
  # label: string;
  # description?: string;
  # emailAddress?: string;
  # phoneNumber?: string;
  # bitcoinAddress?: string;
  # xpub?: string;
  # path?: string;
  # xpubIndex?: number;
  # useXpub?: boolean;
  # useWasabi?: boolean;
  # active?: boolean;

  local randomnumber=${1:-$RANDOM}
  trace 3 "[generate_random_beneficiary] randomnumber=${randomnumber}"

  local label="label${randomnumber}"
  trace 3 "[generate_random_beneficiary] label=${label}"
  local description="description${randomnumber}"
  trace 3 "[generate_random_beneficiary] description=${description}"
  local emailAddress="emailAddress${randomnumber}"
  trace 3 "[generate_random_beneficiary] emailAddress=${emailAddress}"
  local phoneNumber="phoneNumber${randomnumber}"
  trace 3 "[generate_random_beneficiary] phoneNumber=${phoneNumber}"

  local beneficiary='{"label":"'${label}'","description":"'${description}'","emailAddress":"'${emailAddress}'","phoneNumber":"'${phoneNumber}'"}'
  trace 3 "[generate_random_beneficiary] beneficiary=${beneficiary}"

  echo "${beneficiary}"
}

create_beneficiary() {
  trace 2 "\n\n[create_beneficiary] ${BCyan}Creating a new beneficiary...${Color_Off}\n"

  # beneficiaryId?: number;
  # label: string;
  # description?: string;
  # emailAddress?: string;
  # phoneNumber?: string;
  # bitcoinAddress?: string;
  # xpub?: string;
  # path?: string;
  # xpubIndex?: number;
  # useXpub?: boolean;
  # useWasabi?: boolean;
  # active?: boolean;

  local beneficiary=$(generate_random_beneficiary)

  local data='{"id":0,"method":"createBeneficiary","params":'${beneficiary}'}'
  trace 3 "[create_beneficiary] data=${data}"
  trace 3 "[create_beneficiary] Calling createBeneficiary..."
  local createBeneficiary=$(curl -sd "${data}" -H "Content-Type: application/json" donation:8000/api)
  trace 3 "[create_beneficiary] createBeneficiary=${createBeneficiary}"

  echo "${createBeneficiary}"
}

get_beneficiary() {
  trace 2 "\n\n[get_beneficiary] ${BCyan}Get beneficiary...${Color_Off}\n"

  local beneficiary_id=${1}
  trace 3 "[get_beneficiary] beneficiary_id=${beneficiary_id}"

  # Service creates LNURL Withdraw
  local data='{"id":0,"method":"getBeneficiary","params":{"beneficiaryId":'${beneficiary_id}'}}'
  trace 3 "[get_beneficiary] data=${data}"
  trace 3 "[get_beneficiary] Calling getBeneficiary..."
  local getBeneficiary=$(curl -sd "${data}" -H "Content-Type: application/json" donation:8000/api)
  trace 3 "[get_beneficiary] getBeneficiary=${getBeneficiary}"

  echo "${getBeneficiary}"
}

change_beneficiary() {
  trace 2 "\n\n[change_beneficiary] ${BCyan}Change beneficiary...${Color_Off}\n"

  local old_beneficiary=${1}
  trace 3 "[change_beneficiary] old_beneficiary=${old_beneficiary}"

  local new_beneficiary=$(generate_random_beneficiary)
  trace 3 "[change_beneficiary] new_beneficiary=${new_beneficiary}"

  local label=$(echo "${new_beneficiary}" | jq -r ".label")
  trace 3 "[change_beneficiary] label=${label}"
  local description=$(echo "${new_beneficiary}" | jq -r ".description")
  trace 3 "[change_beneficiary] description=${description}"
  local emailAddress=$(echo "${new_beneficiary}" | jq -r ".emailAddress")
  trace 3 "[change_beneficiary] emailAddress=${emailAddress}"
  local phoneNumber=$(echo "${new_beneficiary}" | jq -r ".phoneNumber")
  trace 3 "[change_beneficiary] phoneNumber=${phoneNumber}"

  local new_beneficiary=$(echo "${old_beneficiary}" | jq -Mc --arg lab ${label} --arg description ${description} --arg emailAddress ${emailAddress} --arg phoneNumber ${phoneNumber} '.label = $lab | .description = $description | .emailAddress = $emailAddress | .phoneNumber = $phoneNumber')
  trace 3 "[change_beneficiary] new_beneficiary=${new_beneficiary}"

  echo "${new_beneficiary}"
}

update_beneficiary() {
  trace 2 "\n\n[update_beneficiary] ${BCyan}Update beneficiary...${Color_Off}\n"

  local beneficiary=${1}
  trace 3 "[update_beneficiary] beneficiary=${beneficiary}"
  local new_beneficiary=$(change_beneficiary "${beneficiary}")
  trace 3 "[update_beneficiary] new_beneficiary=${new_beneficiary}"

  local data='{"id":0,"method":"updateBeneficiary","params":'${new_beneficiary}'}'
  trace 3 "[update_beneficiary] data=${data}"
  trace 3 "[update_beneficiary] Calling updateBeneficiary..."
  local updateBeneficiary=$(curl -sd "${data}" -H "Content-Type: application/json" donation:8000/api)
  trace 3 "[update_beneficiary] updateBeneficiary=${updateBeneficiary}"

  echo "${updateBeneficiary}"
}

disable_beneficiary() {
  trace 2 "\n\n[disable_beneficiary] ${BCyan}Disable beneficiary...${Color_Off}\n"

  local beneficiary=${1}
  trace 3 "[disable_beneficiary] beneficiary=${beneficiary}"
  local new_beneficiary=$(echo "${beneficiary}" | jq -Mc ".active = false")
  trace 3 "[disable_beneficiary] new_beneficiary=${new_beneficiary}"

  local data='{"id":0,"method":"updateBeneficiary","params":'${new_beneficiary}'}'
  trace 3 "[disable_beneficiary] data=${data}"
  trace 3 "[disable_beneficiary] Calling updateBeneficiary..."
  local updateBeneficiary=$(curl -sd "${data}" -H "Content-Type: application/json" donation:8000/api)
  trace 3 "[disable_beneficiary] updateBeneficiary=${updateBeneficiary}"

  echo "${updateBeneficiary}"
}

create_donation() {
  trace 2 "\n\n[create_donation] ${BCyan}Create donation...${Color_Off}\n"

  local beneficiary_label=${1}

  local data='{"id":0,"method":"createDonation","params":{"beneficiaryLabel":"'${beneficiary_label}'"}}'
  trace 3 "[create_donation] data=${data}"
  trace 3 "[create_donation] Calling createDonation..."
  local createDonation=$(curl -sd "${data}" -H "Content-Type: application/json" donation:8000/api)
  trace 3 "[create_donation] createDonation=${createDonation}"

  echo "${createDonation}"
}

get_donation() {
  trace 2 "\n\n[get_donation] ${BCyan}Get donation...${Color_Off}\n"

  local donation_token=${1}

  local data='{"id":0,"method":"getDonation","params":{"donationToken":"'${donation_token}'"}}'
  trace 3 "[get_donation] data=${data}"
  trace 3 "[get_donation] Calling getDonation..."
  local getDonation=$(curl -sd "${data}" -H "Content-Type: application/json" donation:8000/api)
  trace 3 "[get_donation] getDonation=${getDonation}"

  echo "${getDonation}"
}

update_donation() {
  trace 2 "\n\n[update_donation] ${BCyan}Update donation...${Color_Off}\n"

  local donation_token=${1}
  local msatoshi=$((500000+$RANDOM))

  local data='{"id":0,"method":"updateDonation","params":{"donationToken":"'${donation_token}'","lnMsatoshi":'${msatoshi}'}}'
  trace 3 "[update_donation] data=${data}"
  trace 3 "[update_donation] Calling updateDonation..."
  local updateDonation=$(curl -sd "${data}" -H "Content-Type: application/json" donation:8000/api)
  trace 3 "[update_donation] updateDonation=${updateDonation}"

  echo "${updateDonation}"
}

ln_pay() {
  trace 2 "\n\n[ln_pay] ${BCyan}Make a LN payment...${Color_Off}\n"

  local bolt11=${1}
  trace 3 "[ln_pay] bolt11=${bolt11}"

  local data='{"id":1,"jsonrpc": "2.0","method":"pay","params":{"bolt11":"'${bolt11}'"}}'
  trace 3 "[ln_pay] data=${data}"
  local paid=$(curl -sd "${data}" -H 'X-Access:FoeDdQw5yl7pPfqdlGy3OEk/txGqyJjSbVtffhzs7kc=' -H "Content-Type: application/json" cyphernode_sparkwallet2:9737/rpc)
  trace 3 "[ln_pay] paid=${paid}"

  echo "${paid}"
}

bitcoin_spend() {
  trace 2 "\n\n[bitcoin_send] ${BCyan}Make a Bitcoin payment...${Color_Off}\n"

  local btc_address=${1}
  trace 3 "[bitcoin_send] btc_address=${btc_address}"

  local amount=$((500000+$RANDOM))

  local data='{"address":"'${btc_address}'","amount":0.00'${amount}'}'
  trace 3 "[bitcoin_send] data=${data}"
  # curl -d "${data}" -H "Content-Type: application/json" proxy:8888/spend
  local paid=$(curl -sd "${data}" -H "Content-Type: application/json" proxy:8888/spend)
  trace 3 "[bitcoin_send] paid=${paid}"

  echo "${paid}"
}

happy_path() {
  # Happy path:
  #
  # 1. Create a new beneficiary
  # 2. Get it, compare
  # 3. Update beneficiary
  # 4. Get it, compare
  #
  # 5. Create a donation
  # 6. Get it, compare
  # 7. Update the donation with LN
  # 8. Get it, compare
  #
  # 9. Make a LN payment
  # 10. Get donation, make sure LN payment in
  #
  # 11. Create a donation
  # 12. Make an on-chain payment
  # 13. Get donation, make sure Bitcoin payment in

  trace 1 "\n\n[happy_path] ${On_Yellow}${BBlack} Happy path:                                                                     ${Color_Off}\n"

  # 1. Create a new beneficiary
  local createdBene=$(create_beneficiary | jq -Mc ".result")
  trace 3 "[happy_path] createdBene=${createdBene}"
  local id=$(echo "${createdBene}" | jq ".beneficiaryId")
  trace 3 "[happy_path] id=${id}"

  # 2. Get it, compare
  local gottenBene=$(get_beneficiary "${id}" | jq -Mc ".result")
  trace 3 "[happy_path] gottenBene=${gottenBene}"

  local equals=$(jq --argjson a "${createdBene}" --argjson b "${gottenBene}" -n '$a == $b')
  trace 3 "[happy_path] equals=${equals}"
  if [ "${equals}" = "true" ]; then
    trace 2 "[happy_path] EQUALS!"
  else
    trace 1 "\n[happy_path] ${On_Red}${BBlack}  Happy path: NOT EQUALS!                                                                          ${Color_Off}\n"
    return 1
  fi

  # 3. Update beneficiary
  local updatedBene=$(update_beneficiary "${gottenBene}" | jq -Mc ".result")
  trace 3 "[happy_path] updatedBene=${updatedBene}"
  local equals=$(jq --argjson a "${gottenBene}" --argjson b "${updatedBene}" -n '$a == $b')
  trace 3 "[happy_path] equals=${equals}"
  if [ "${equals}" = "false" ]; then
    trace 2 "[happy_path] NOT EQUALS!  Good!"
  else
    trace 1 "\n[happy_path] ${On_Red}${BBlack}  Happy path: EQUALS!                                                                          ${Color_Off}\n"
    return 1
  fi

  # 4. Get it, compare
  local gottenUpdatedBene=$(get_beneficiary "${id}" | jq -Mc ".result")
  trace 3 "[happy_path] gottenUpdatedBene=${gottenUpdatedBene}"

  local equals=$(jq --argjson a "${updatedBene}" --argjson b "${gottenUpdatedBene}" -n '$a == $b')
  trace 3 "[happy_path] equals=${equals}"
  if [ "${equals}" = "true" ]; then
    trace 2 "[happy_path] EQUALS!"
  else
    trace 1 "\n[happy_path] ${On_Red}${BBlack}  Happy path: NOT EQUALS!                                                                          ${Color_Off}\n"
    return 1
  fi

  # 5. Create a donation
  local label=$(echo "${gottenUpdatedBene}" | jq -r ".label")
  trace 3 "[happy_path] label=${label}"

  local createdDonation=$(create_donation "${label}" | jq -Mc ".result")
  trace 3 "[happy_path] createdDonation=${createdDonation}"
  local token=$(echo "${createdDonation}" | jq -r ".donationToken")
  trace 3 "[happy_path] token=${token}"

  # 6. Get it, compare
  local gottenDonation=$(get_donation "${token}" | jq -Mc ".result")
  trace 3 "[happy_path] gottenDonation=${gottenDonation}"

  local equals=$(jq --argjson a "${createdDonation}" --argjson b "${gottenDonation}" -n '$a == $b')
  trace 3 "[happy_path] equals=${equals}"
  if [ "${equals}" = "true" ]; then
    trace 2 "[happy_path] EQUALS!"
  else
    trace 1 "\n[happy_path] ${On_Red}${BBlack}  Happy path: NOT EQUALS!                                                                          ${Color_Off}\n"
    return 1
  fi

  # 7. Update the donation with LN
  local updatedDonation=$(update_donation "${token}" | jq -Mc ".result")
  trace 3 "[happy_path] updatedDonation=${updatedDonation}"

  # 8. Get it, compare
  local gottenUpdatedDonation=$(get_donation "${token}" | jq -Mc ".result")
  trace 3 "[happy_path] gottenUpdatedDonation=${gottenUpdatedDonation}"

  local equals=$(jq --argjson a "${updatedDonation}" --argjson b "${gottenUpdatedDonation}" -n '$a == $b')
  trace 3 "[happy_path] equals=${equals}"
  if [ "${equals}" = "true" ]; then
    trace 2 "[happy_path] EQUALS!"
  else
    trace 1 "\n[happy_path] ${On_Red}${BBlack}  Happy path: NOT EQUALS!                                                                          ${Color_Off}\n"
    return 1
  fi

  # 9. Make a LN payment
  local bolt11=$(echo "${gottenUpdatedDonation}" | jq -r ".bolt11")
  trace 3 "[happy_path] bolt11=${bolt11}"

  local paid=$(ln_pay "${bolt11}")
  trace 3 "[happy_path] paid=${paid}"

  local status=$(echo "${paid}" | jq -r ".status")
  trace 3 "[happy_path] status=${status}"
  if [ "${status}" = "complete" ]; then
    trace 2 "[happy_path] PAID!"
  else
    trace 1 "\n[happy_path] ${On_Red}${BBlack}  Happy path: NOT PAID!                                                                          ${Color_Off}\n"
    return 1
  fi

  # 10. Get donation, make sure LN payment in
  local gottenLnPaidDonation=$(get_donation "${token}" | jq -Mc ".result")
  trace 3 "[happy_path] gottenLnPaidDonation=${gottenLnPaidDonation}"

  status=$(echo "${gottenLnPaidDonation}" | jq -r ".lnInvoiceStatus")
  trace 3 "[happy_path] status=${status}"
  if [ "${status}" = "paid" ]; then
    trace 2 "[happy_path] PAID in Donation!"
  else
    trace 1 "\n[happy_path] ${On_Red}${BBlack}  Happy path: NOT PAID in Donation!                                                                          ${Color_Off}\n"
    return 1
  fi

  # 11. Create a donation
  label=$(echo "${gottenUpdatedBene}" | jq -r ".label")
  trace 3 "[happy_path] label=${label}"

  createdBitcoinDonation=$(create_donation "${label}" | jq -Mc ".result")
  trace 3 "[happy_path] createdBitcoinDonation=${createdBitcoinDonation}"
  token=$(echo "${createdBitcoinDonation}" | jq -r ".donationToken")
  trace 3 "[happy_path] token=${token}"

  # 12. Make an on-chain payment
  local btc_address=$(echo "${createdBitcoinDonation}" | jq -r ".bitcoinAddress")
  trace 3 "[happy_path] btc_address=${btc_address}"
  bitcoin_spend=$(bitcoin_spend "${btc_address}")
  trace 3 "[happy_path] bitcoin_spend=${bitcoin_spend}"
  local amount_sent=$(echo "${bitcoin_spend}" | jq -r ".details.amount")
  trace 3 "[happy_path] amount_sent=${amount_sent}"

  trace 3 "[happy_path] Sleeping 10 seconds..."
  sleep 10

  # 13. Get donation, make sure Bitcoin payment in
  local gottenBitcoinPaidDonation=$(get_donation "${token}" | jq -Mc ".result")
  trace 3 "[happy_path] gottenBitcoinPaidDonation=${gottenBitcoinPaidDonation}"

  local bitcoin_amount=$(echo "${gottenBitcoinPaidDonation}" | jq -r ".bitcoinAmount")
  trace 3 "[happy_path] bitcoin_amount=${bitcoin_amount}"
  if [ "${bitcoin_amount}" = "${amount_sent}" ]; then
    trace 1 "\n\n[happy_path] ${On_IGreen}${BBlack}  Happy path: SUCCESS!                                                                       ${Color_Off}\n"
    date
    return 0
  else
    trace 1 "\n\n[happy_path] ${On_Red}${BBlack}  Happy path: FAILURE!                                                                         ${Color_Off}\n"
    date
    return 1
  fi
}

inexistent() {
  # Test inexistent:
  #
  # 1. Try to get inexistent beneficiary
  # 2. Try to update inexistent beneficiary

  trace 1 "\n\n[inexistent] ${On_Yellow}${BBlack} Test inexistent beneficiary:                                                             ${Color_Off}\n"

  # 1. Try to get inexistent beneficiary
  local error=$(get_beneficiary "999999999" | jq -Mc ".error")
  trace 3 "[inexistent] error=${error}"
  local msg=$(echo "${error}" | jq ".message")
  trace 3 "[inexistent] msg=${msg}"

  echo "${msg}" | grep -qi "not found"
  if [ "$?" -ne "0" ]; then
    trace 1 "\n\n[inexistent] ${On_Red}${BBlack} inexistent: FOUND!  Should not.                                                                   ${Color_Off}\n"
    return 1
  else
    trace 2 "[inexistent] NOT FOUND!  Good!"
  fi

  local data='{"beneficiaryId":999999999,"label":"label2402","description":"description2402","emailAddress":"emailAddress2402","phoneNumber":"phoneNumber2402","bitcoinAddress":null,"xpub":null,"path":null,"xpubIndex":0,"useXpub":0,"useWasabi":0,"active":1,"createdAt":"2021-09-15 18:19:13","updatedAt":"2021-09-15 18:19:14"}'

  # 2. Try to update inexistent beneficiary
  error=$(update_beneficiary "${data}" | jq -Mc ".error")
  trace 3 "[inexistent] error=${error}"
  msg=$(echo "${error}" | jq ".message")
  trace 3 "[inexistent] msg=${msg}"

  echo "${msg}" | grep -qi "not found"
  if [ "$?" -ne "0" ]; then
    trace 1 "\n\n[inexistent] ${On_Red}${BBlack} inexistent: FOUND!  Should not.                                                                         ${Color_Off}\n"
    return 1
  else
    trace 1 "\n\n[inexistent] ${On_IGreen}${BBlack} inexistent: SUCCESS!                                                                       ${Color_Off}\n"
  fi
}

donate_inactive() {
  # Donate to inactive beneficiary:
  #
  # 1. Create a new beneficiary
  # 2. Update it with active=false
  # 3. Create a donation and make sure it fails

  trace 1 "\n\n[donate_inactive] ${On_Yellow}${BBlack} Donate to inactive beneficiary:                                                                     ${Color_Off}\n"

  # 1. Create a new beneficiary
  local createdBene=$(create_beneficiary | jq -Mc ".result")
  trace 3 "[donate_inactive] createdBene=${createdBene}"

  # 2. Update it with active=false
  local gottenBene=$(disable_beneficiary "${createdBene}" | jq -Mc ".result")
  trace 3 "[donate_inactive] updatedBene=${gottenBene}"

  local updatedBene=$(update_beneficiary "${gottenBene}" | jq -Mc ".result")
  trace 3 "[donate_inactive] updatedBene=${updatedBene}"
  local equals=$(jq --argjson a "${gottenBene}" --argjson b "${updatedBene}" -n '$a == $b')
  trace 3 "[donate_inactive] equals=${equals}"
  if [ "${equals}" = "false" ]; then
    trace 2 "[donate_inactive] NOT EQUALS!  Good!"
  else
    trace 1 "\n[donate_inactive] ${On_Red}${BBlack}  Happy path: EQUALS!                                                                          ${Color_Off}\n"
    return 1
  fi

  local label=$(echo "${updatedBene}" | jq -r ".label")
  trace 3 "[donate_inactive] label=${label}"

  # 3. Create a donation and make sure it fails
  local error=$(donate "${label}" | jq -Mc ".error")
  trace 3 "[donate_inactive] error=${error}"
  local msg=$(echo "${error}" | jq ".message")
  trace 3 "[donate_inactive] msg=${msg}"

  echo "${msg}" | grep -qi "so such"
  if [ "$?" -ne "0" ]; then
    trace 1 "\n\n[donate_inactive] ${On_IGreen}${BBlack} donate_inactive: SUCCESS!                                                                       ${Color_Off}\n"
  else
    trace 1 "\n\n[donate_inactive] ${On_Red}${BBlack} donate_inactive: FOUND!  Should not.                                                                   ${Color_Off}\n"
    return 1
  fi
}

TRACING=3

trace 1 "${Color_Off}"
date

# Install needed packages
trace 2 "\n\n${BCyan}Installing needed packages...${Color_Off}\n"
apk add curl jq

# Initializing test variables
trace 2 "\n\n${BCyan}Initializing test variables...${Color_Off}\n"

happy_path \
&& inexistent \
&& donate_inactive

trace 1 "\n\n${BCyan}Finished, deleting this test container...${Color_Off}\n"
