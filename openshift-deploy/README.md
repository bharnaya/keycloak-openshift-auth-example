## Keycloak Deploy Scripts

Work derived from [https://gitlab.com/sgk/keycloak-deployconf](https://gitlab.com/sgk/keycloak-deployconf) with two important differences:

  * No persistent volume - as that was failing for me on  [minishift](https://github.com/minishift/minishift#installation)
  * Docker image ([bartoszmajsak/keycloak-postgres](https://hub.docker.com/r/bartoszmajsak/keycloak-postgres/)) for `keycloak-server` derived from [registry.centos.org/mohammedzee1000/keycloak-postgres](https://github.com/mohammedzee1000/jboss-dockerfiles_keycloak/blob/2017-01-17_13-58-44-keycloak_os_perms_fix/server-postgres/Dockerfile), but adds [OpenShift Identity Provider](https://github.com/bartoszmajsak/keycloak-openshift-identity-provider) to KeyCloak 

### How to set it up?

Create a new project in OpenShift

```
$ oc new-project keycloak --display-name="Keycloak server" \
--description="keycloak server + postgres"
```
and run 

```
$ deploy.sh
```

### Customization options

#### KeyCloak

edit environment variables:

                "env":[
                  {
                    "name":"KEYCLOAK_USER",
                    "value":"admin"
                  },
                  {
                    "name":"KEYCLOAK_PASSWORD",
                    "value":"admin"
                  },
                  {
                    "name":"POSTGRES_DATABASE",
                    "value":"userdb"
                  },
                  {
                    "name":"POSTGRES_USER",
                    "value":"keycloak"
                  },
                  {
                    "name":"POSTGRES_PASSWORD",
                    "value":"password"
                  },
                  {
                    "name":"POSTGRES_PORT_5432_TCP_ADDR",
                    "value":"postgres"
                  },
                  {
                    "name":"POSTGRES_PORT_5432_TCP_PORT",
                    "value":"5432"
                  }
                ]


#### Postgresql 

            "env": [
              {
                "name": "POSTGRESQL_USER",
                "value": "keycloak"
              },
              {
                "name": "POSTGRESQL_PASSWORD",
                "value": "password"
              },
              {
                "name": "POSTGRESQL_DATABASE",
                "value": "userdb"
              },
              {
                "name": "POSTGRESQL_ADMIN_PASSWORD",
                "value": "password"
              }
            ]
