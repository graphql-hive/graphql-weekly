# meta-fetcher
Build meta-fetcher with [webtask-bundle](https://github.com/auth0/webtask-bundle) and create a webtask from the build

## Bundle the meta-fetcher

```sh
npm i -g webtask-bundle
wt-bundle --output ./build/meta-fetcher.js ./meta-fetcher.js
```

## Compress the bundle

As the build file is too large for the free webtask tier, we have to manually compress it.

Use [jscompress[https://jscompress.com/) for example.

## Create the webtask

`wt create ./build/meta-fetcher.js`
