## Set up local enviroment


Start a OpenShift Origin cluster. Refer to my blog (https://medium.com/@james_devcomb/openshift-on-vps-like-scaleways-with-hostname-4b3ef8942f83)[https://medium.com/@james_devcomb/openshift-on-vps-like-scaleways-with-hostname-4b3ef8942f83] on how to get this setup.

```
oc login -u developer
oc new-project keycloak --display-name="Keycloak server" --description="keycloak server + postgres"
```

Deploy keycloak and postgres

```
yum install -y git
git clone https://github.com/devcomb/keycloak-openshift-auth-example.git
cd keycloak-openshift-auth-example/openshift-deploy
oc new-app -f keycloak_psql_template.json
```

Open KeyCloak (e.g. `google-chrome --incognito http://keycloak-keycloak.$(hostname)/auth/admin`). Log in with username 'admin' and password 'changeme123'. You could set this password to something else by changing the enviroment variable KEYCLOAK_PASSWORD in (keycloak_psql_template.json)[https://github.com/devcomb/keycloak-openshift-auth-example/blob/master/openshift-deploy/keycloak_psql_template.json#L21] for future deployments.

Add a new identity provider "Openshift v3" once logged into keycloak. Provide the following information into the form and of course replace the $(hostname) with your hostname.



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
