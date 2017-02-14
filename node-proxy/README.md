# openshift-insecure-proxy

Proxy to bypass self-signed SSL certificates in minishift.

You should have [minishift](https://github.com/minishift/minishift#installation) installed first.

## Example Usage

``` 
$ npm start -- --targetHost=$(minishift ip) --targetPort=8443 
```

or

```
node proxy.js --targetHost=$(minishift ip) --targetPort=8443  
```

### Docker container

```
docker run --net=host -p 9009:9009 bartoszmajsak/minishift-ignore-cert-proxy \
--targetHost=$(minishift ip) --targetPort=8443
```

