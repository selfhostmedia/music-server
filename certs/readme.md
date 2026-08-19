# Synology encryption keys

These keys are required for Synology compatibility, an API request shares the public key with their client mobile app and uses it to encrypt credentials when signing in to ensure that credentials are not sent in clear text over the network even when your Synology NAS is not using SSL.

You can replace these keys:

```bash
$ openssl genrsa -out private.pem 4096
$ openssl rsa -in private.pem -pubout -out public.pem
```
