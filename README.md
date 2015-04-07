# meta-blob-store

[![blob-store-compatible](https://raw.githubusercontent.com/maxogden/abstract-blob-store/master/badge.png)](https://github.com/maxogden/abstract-blob-store)

This is a way of tying together several different [blob-stores](https://www.npmjs.com/package/abstract-blob-store) to operate as one.

The module exports a single function taking in a config object, and returns a blob-store. The properties of the config object
correspond to the methods available on blob-stores (i.e. `createReadStream`, `createWriteStream`, `exists`, `remove`). If `exists` is omitted,
the blob-store for `createReadStream` is used instead for those calls. `remove` also defers to `createWriteStream` in the same way. Each
of these can either be a blob store to forward the calls for that method to, or an array of arrays that's used to match keys to blob-stores
based on regular expressions. For example:

```javascript
var metaStore = MetaBlobStore({
    createReadStream: [
        [/^foo/, blobStore1],
        [/.*/, blobStore2]
    ],
    createWriteStream: blobStore3
});
```

In this example, for `createReadStream` and `exists` calls, the call will be sent to `blobStore2` except when the key in the arguments
starts with `foo`, in which case the call will be sent to `blobStore1`. All calls to `createWriteStream` and `remove` are sent to
`blobStore3`.

One thing this doesn't cover is cases where you want to send the calls to more than one blob store. This is farily complex since there are
many cases. Do you want to write to both all the time or alternate? Do you want to read from both and append one to the other? Or some
other stream multiplexing? Different use cases call for different solutions here, so this is left as an exercise.

This all allows for some pretty complicated routing of your blobs, so be careful!

## License

MIT. See LICENSE.txt
