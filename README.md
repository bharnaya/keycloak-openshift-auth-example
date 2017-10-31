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

Add a new identity provider "Openshift v3" once logged into keycloak. Provide the following information into the form and of course replace the "$(hostname)" with your hostname and "<keycloak api password>" with a new password for keycloak to use with API calls to openshift. 

Client ID = admin
Client Secret = <keycloak api password>
Base Url = https://$(hostname):8443/oapi/v1

![Add Identity Provider](https://github.com/devcomb/keycloak-openshift-auth-example/raw/master/Add_identity_provider.jpg)

Create client. Replace '<keycloak api password>' with the same password used above.

```
$ oc login -u system:admin
$ oc create -f <(echo "   
{
    \"kind\": \"OAuthClient\",
    \"apiVersion\": \"v1\",
    \"metadata\": {
    \"name\": \"openshift-v3-authentication\"
    },
    \"secret\": \"<keycloak api password>\",
    \"grantMethod\": \"prompt\",
    \"redirectURIs\": [
        \"http://keycloak-keycloak.$(hostname)/auth/realms/master/broker/openshift-v3/endpoint\"
    ]
}")
$ oc login -u developer
```

## Build project and deploy

```
cd ..
yum install -y maven
docker run -it -v $(pwd):/usr/src/app --rm maven:3.2-jdk-7-onbuild mvn clean package
mkdir -p deployments \
cp target/openshift-v3-authentication.war deployments/openshift-v3-authentication.war \
oc rsync ./deployments $(oc get pods | grep keycloak | cut -d' ' -f1):/opt/jboss/keycloak/standalone/
```

## Test

First we need small proxy to ignore self-signed certificates from `minishift`. Simply start this docker container:
```
$ docker run -d --net=host -p 9009:9009 bartoszmajsak/minishift-ignore-cert-proxy \
  --targetHost=$(hostname) --targetPort=8443
```

Open demo application:

```
google-chrome --incognito http://keycloak-keycloak.$(hostname)/openshift-v3-authentication
```

Click on "Openshift V3" and authorize demo app. Then register your user. After landing on the dummy page you are able to load Openshift profile by clicking a "load" button.
