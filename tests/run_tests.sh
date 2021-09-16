#!/bin/sh

# ./mine.sh
./ln_reconnect.sh

docker run --rm -d --name donation_test -v "$PWD:/tests" --network=cyphernodeappsnet alpine sh -c 'while true; do sleep 10; done'
docker network connect cyphernodenet donation_test
docker exec -it donation_test /tests/donation.sh
docker stop donation_test
