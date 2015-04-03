/*
 * Copyright (c) 2015, Yahoo! Inc. All rights reserved.
 * Code licensed under the MIT License.
 * See LICENSE.txt file.
 */
function arrify(thing) {
    return Array.isArray(thing) ? thing : [[/.*/, thing]];
}

module.exports = function MetaBlobStore(options){
    if (!(this instanceof MetaBlobStore)) {
        return new MetaBlobStore(options);
    }
    options.createReadStream = arrify(options.createReadStream);
    options.createWriteStream = arrify(options.createWriteStream);
    options.exists = options.exists ? arrify(options.exists) : options.createReadStream;
    options.remove = options.remove ? arrify(options.remove) : options.createWriteStream;
    Object.keys(options).forEach(function(func){
        this[func] = function passThru(opts, cb) {
            var key = opts ? (typeof opts === 'string' ? opts : opts.key) : '', stores = options[func];
            for (var i = 0; i < stores.length; i++) {
                if (stores[i][0].test(key)) {
                    return stores[i][1][func](opts, cb);
                }
            }
            throw Error('No '+func+' blobstore for '+key);
        };
    }, this);
}
