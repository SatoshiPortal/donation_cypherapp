#!/bin/sh

# createBeneficiary
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

  data='{"id":0,"method":"createBeneficiary","params":'${beneficiary}'}'
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
  data='{"id":0,"method":"getBeneficiary","params":{"beneficiaryId":'${beneficiary_id}'}}'
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

  data='{"id":0,"method":"updateBeneficiary","params":'${new_beneficiary}'}'
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

  data='{"id":0,"method":"updateBeneficiary","params":'${new_beneficiary}'}'
  trace 3 "[disable_beneficiary] data=${data}"
  trace 3 "[disable_beneficiary] Calling updateBeneficiary..."
  local updateBeneficiary=$(curl -sd "${data}" -H "Content-Type: application/json" donation:8000/api)
  trace 3 "[disable_beneficiary] updateBeneficiary=${updateBeneficiary}"

  echo "${updateBeneficiary}"
}

donate() {
  trace 2 "\n\n[donate] ${BCyan}Donate...${Color_Off}\n"

  beneficiary_label=${1}

  data='{"id":0,"method":"createDonation","params":{"beneficiaryLabel":"'${beneficiary_label}'"}}'
  trace 3 "[donate] data=${data}"
  trace 3 "[donate] Calling createDonation..."
  local createDonation=$(curl -sd "${data}" -H "Content-Type: application/json" donation:8000/api)
  trace 3 "[donate] createDonation=${createDonation}"

  echo "${createDonation}"
}

happy_path() {
  # Happy path:
  #
  # 1. Create a new Beneficiary
  # 2. Get it and compare
  # 3. Modify it
  # 4. Get it and compare

  trace 1 "\n\n[happy_path] ${On_Yellow}${BBlack} Happy path:                                                                     ${Color_Off}\n"

  # CREATE
  local bene1=$(create_beneficiary | jq -Mc ".result")
  trace 3 "[happy_path] bene1=${bene1}"
  local id=$(echo "${bene1}" | jq ".beneficiaryId")
  trace 3 "[happy_path] id=${id}"

  # GET
  local bene2=$(get_beneficiary "${id}" | jq -Mc ".result")
  trace 3 "[happy_path] bene2=${bene2}"

  # COMPARE
  local equals=$(jq --argjson a "${bene1}" --argjson b "${bene2}" -n '$a == $b')
  trace 3 "[happy_path] equals=${equals}"
  if [ "${equals}" = "true" ]; then
    trace 2 "[happy_path] EQUALS!"
  else
    trace 1 "\n[happy_path] ${On_Red}${BBlack}  Happy path: NOT EQUALS!                                                                          ${Color_Off}\n"
    return 1
  fi

  # UPDATE
  local bene3=$(update_beneficiary "${bene2}" | jq -Mc ".result")
  trace 3 "[happy_path] bene3=${bene3}"
  local equals=$(jq --argjson a "${bene2}" --argjson b "${bene3}" -n '$a == $b')
  trace 3 "[happy_path] equals=${equals}"
  if [ "${equals}" = "false" ]; then
    trace 2 "[happy_path] NOT EQUALS!  Good!"
  else
    trace 1 "\n[happy_path] ${On_Red}${BBlack}  Happy path: EQUALS!                                                                          ${Color_Off}\n"
    return 1
  fi

  # GET
  local bene4=$(get_beneficiary "${id}" | jq -Mc ".result")
  trace 3 "[happy_path] bene4=${bene4}"

  # COMPARE
  local equals=$(jq --argjson a "${bene3}" --argjson b "${bene4}" -n '$a == $b')
  trace 3 "[happy_path] equals=${equals}"
  if [ "${equals}" = "true" ]; then
    trace 2 "[happy_path] EQUALS!"
  else
    trace 1 "\n[happy_path] ${On_Red}${BBlack}  Happy path: NOT EQUALS!                                                                          ${Color_Off}\n"
    return 1
  fi

  if [ "${equals}" = "true" ]; then
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
  # inexistent:
  #
  # 1. Get inexistent beneficiary
  # 1. Update inexistent beneficiary

  trace 1 "\n\n[inexistent] ${On_Yellow}${BBlack} inexistent:                                                                     ${Color_Off}\n"

  # Try to GET
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

  # Try to UPDATE
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
  # 1. Create a new Beneficiary
  # 3. Update it to active=false
  # 4. Donate to it

  trace 1 "\n\n[donate_inactive] ${On_Yellow}${BBlack} Donate to inactive beneficiary:                                                                     ${Color_Off}\n"

  # CREATE
  local bene1=$(create_beneficiary | jq -Mc ".result")
  trace 3 "[donate_inactive] bene1=${bene1}"

  # Disable
  local bene2=$(disable_beneficiary "${bene1}" | jq -Mc ".result")
  trace 3 "[donate_inactive] bene3=${bene2}"

  # UPDATE
  local bene3=$(update_beneficiary "${bene2}" | jq -Mc ".result")
  trace 3 "[donate_inactive] bene3=${bene3}"
  local equals=$(jq --argjson a "${bene2}" --argjson b "${bene3}" -n '$a == $b')
  trace 3 "[donate_inactive] equals=${equals}"
  if [ "${equals}" = "false" ]; then
    trace 2 "[donate_inactive] NOT EQUALS!  Good!"
  else
    trace 1 "\n[donate_inactive] ${On_Red}${BBlack}  Happy path: EQUALS!                                                                          ${Color_Off}\n"
    return 1
  fi

  local label=$(echo "${bene3}" | jq -r ".label")
  trace 3 "[donate_inactive] label=${label}"

  # DONATE
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
