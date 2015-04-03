var MetaBlobStore = require('./index');
var test = require('tape');
var MemBlobs = require('abstract-blob-store');

function makeExampleStore(x){
    return {
        createReadStream: function(){
            this._.createReadStream.push([].slice.call(arguments));
            return x;
        },
        createWriteStream: function(){
            this._.createWriteStream.push([].slice.call(arguments));
            return x;
        },
        exists: function(){
            this._.exists.push([].slice.call(arguments));
            return x;
        },
        remove: function(){
            this._.remove.push([].slice.call(arguments));
            return x;
        },
        _: {
            createReadStream: [],
            createWriteStream: [],
            exists: [],
            remove: []
        }
    }
}

test('createReadStream, createWriteStream', function(t){
    var sampleCreateReadStream = makeExampleStore(1),
        sampleCreateWriteStream = makeExampleStore(2);
    var store = MetaBlobStore({
        createReadStream: sampleCreateReadStream,
        createWriteStream: sampleCreateWriteStream
    });
    t.equal(store.createReadStream('2','3','4'), 1);
    t.equal(store.createWriteStream('3','4','5'), 2);
    t.equal(store.exists('4','5','6'), 1);
    t.equal(store.remove('5','6','7'), 2);
    t.deepEqual(sampleCreateReadStream._, {
        createReadStream: [ [ '2', '3' ] ],
        createWriteStream: [],
        exists: [ [ '4', '5' ] ],
        remove: []
    });
    t.deepEqual(sampleCreateWriteStream._, {
        createReadStream: [],
        createWriteStream: [ [ '3', '4' ] ],
        exists: [],
        remove: [ [ '5', '6' ] ]
    });
    t.end();
});

test('createReadStream, createWriteStream, exists, remove', function(t){
    var sampleCreateReadStream = makeExampleStore(1),
        sampleCreateWriteStream = makeExampleStore(2),
        sampleExists = makeExampleStore(3),
        sampleRemove = makeExampleStore(4);
    var store = MetaBlobStore({
        createReadStream: sampleCreateReadStream,
        createWriteStream: sampleCreateWriteStream,
        exists: sampleExists,
        remove: sampleRemove
    });
    t.equal(store.createReadStream('2','3','4'), 1);
    t.equal(store.createWriteStream('3','4','5'), 2);
    t.equal(store.exists('4','5','6'), 3);
    t.equal(store.remove('5','6','7'), 4);
    t.deepEqual(sampleCreateReadStream._, {
        createReadStream: [ [ '2', '3' ] ],
        createWriteStream: [],
        exists: [],
        remove: []
    });
    t.deepEqual(sampleCreateWriteStream._, {
        createReadStream: [],
        createWriteStream: [ [ '3', '4' ] ],
        exists: [],
        remove: []
    });
    t.deepEqual(sampleExists._, {
        createReadStream: [],
        createWriteStream: [],
        exists: [ [ '4', '5' ] ],
        remove: []
    });
    t.deepEqual(sampleRemove._, {
        createReadStream: [],
        createWriteStream: [],
        exists: [],
        remove: [ [ '5', '6' ] ]
    });
    t.end();
});

test('multiple back-end stores and different keys (also new, error)', function(t){
    var store1 = makeExampleStore(),
        store2 = makeExampleStore(), 
        store3 = makeExampleStore();
    var store = new MetaBlobStore({
        createReadStream: [
            [/foo/, store1],
            [/bar/, store2]
        ],
        createWriteStream: store3
    });
    store.createReadStream({key: 'foo'});
    store.createReadStream('bar');
    store.createWriteStream();
    t.deepEqual(store1._, {
        createReadStream: [ [ { key: 'foo' }, undefined ] ],
        createWriteStream: [],
        exists: [],
        remove: []
    });
    t.deepEqual(store2._, {
        createReadStream: [ [ 'bar', undefined ] ],
        createWriteStream: [],
        exists: [],
        remove: []
    });
    t.deepEqual(store3._, {
        createReadStream: [],
        createWriteStream: [ [ undefined, undefined ] ],
        exists: [],
        remove: []
    });
    t.throws(function(){
        store.createReadStream('baz');
    })
    t.end();
});

require('abstract-blob-store/tests')(test, {
    setup: function(t, cb){
        var backingStore = new MemBlobs();
        cb(null, MetaBlobStore({createReadStream: backingStore, createWriteStream: backingStore}));
    },
    teardown: function(t, store, blob, cb){
        cb();
    }
});
