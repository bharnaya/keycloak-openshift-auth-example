oc delete all -l app=microcks
oc delete pvc microcks-mongodb
oc delete svc microcks-postman-runtime microcks microcks-mongodb 
oc delete cm microcks-config
