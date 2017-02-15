## Set up local enviroment


``` 
minishift start
```

```
oc new-project keycloak --display-name="Keycloak server" --description="keycloak server + postgres"
```

Deploy keycloak and postgres

```
pushd ${PWD}/openshift-deploy
./deploy.sh
popd
```

Open KeyCloak (e.g. `google-chrome --incognito http://keycloak-keycloak.$(minishift ip).xip.io/auth/admin`) and import realm `openshift-v3-identity-provider-realm.json`.

Create client

```
$ oc login -u system:admin
$ oc create -f <(echo "   
{
    \"kind\": \"OAuthClient\",
    \"apiVersion\": \"v1\",
    \"metadata\": {
    \"name\": \"openshift-v3-authentication\"
    },
    \"secret\": \"1234\",
    \"grantMethod\": \"prompt\",
    \"redirectURIs\": [
        \"http://keycloak-keycloak.$(minishift ip).xip.io/auth/realms/openshift-v3-identity-provider-realm/broker/openshift-v3/endpoint\"
    ]
}")
$ oc login -u developer
```

Configure Openshift Provider in KeyCloak:
  * Provide URL to minishift instance (e.g. use `$ echo "https://$(minishift ip):8443" | xclip -sel c` to copy to `Base URL` field)
  * **(for dev only)** Disable SSL certificates validation


## Build project and deploy

```
mvn clean package && mkdir -p deployments && cp target/openshift-v3-authentication.war deployments/openshift-v3-authentication.war \
 && oc rsync ./deployments $(oc get pods | grep keycloak | cut -d' ' -f1):/opt/jboss/keycloak/standalone/
```

## Test

First we need small proxy to ignore self-signed certificates from `minishift`. Simply start this docker container:
```
$ docker run -d --net=host -p 9009:9009 bartoszmajsak/minishift-ignore-cert-proxy \
  --targetHost=$(minishift ip) --targetPort=8443
```

Open demo application:

```
google-chrome --incognito http://keycloak-keycloak.$(minishift ip).xip.io/openshift-v3-authentication
```

Click on "Openshift V3" and authorize demo app. Then register your user. After landing on the dummy page you are able to load Openshift profile by clicking a "load" button.
