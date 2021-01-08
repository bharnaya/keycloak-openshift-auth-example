oc delete dc keycloak-server
oc delete svc    keycloak
oc delete route   keycloak
oc delete pvc     persistentvolumeclaim storage0
oc delete     service postgres
oc delete all -l app=keycloak
