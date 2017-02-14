#!/bin/bash 

# deploying postgresql
oc new-app -f postgresql.json
sleep 20

# deploying keycloak
oc new-app -f keycloak.json
