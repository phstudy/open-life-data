var _  = require('underscore');
_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string'); // => true

var request = require('request');

var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;

var key = process.env['MAP_API_KEY'] != null ? process.env['MAP_API_KEY'] : 'AIzaSyDg_mZ_Jk_zFx2ngzzCERSvGN9VzX4QzwM';
var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : '10.211.55.13';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : 27017;

console.log("Connecting to " + host + ":" + port);

MongoClient.connect(format('mongodb://%s:%s/iculture?w=1', host, port), function(err, db) {
    if(err) throw err;

    var places = db.collection('places');
    var geocodes = db.collection('geocodes');

    // set 2d index on location 
    places.ensureIndex( { "location": "2d" }, function(err){
        if(err) {
            throw err;
        }
        else {
            console.log("Creating a geospatial index on the location field successfully.");
        }
    });



    var cursor = places.find({ $query : {"location" : { "$exists" : false } }, $snapshot : true });
    var count = 0;
    cursor.each(function(err, doc) {
        if(doc != null) {
            count++;
            var belong_city_name_array = doc.belong_city_name.split(/[ ]+/); 
            var city=belong_city_name_array[0];
            var district=belong_city_name_array[1];

            // fill city
            var belong_address = doc.belong_address;
            var cidx = belong_address.indexOf(city);
            if(cidx == -1) {
                belong_address = _(belong_address).insert(0, city);
            }

            // fill district
            var didx = belong_address.indexOf(district);
            if(didx == -1) {
                belong_address = _(belong_address).insert(city.length, district);
            }

            setTimeout(function(){
                request.get(format('https://maps.googleapis.com/maps/api/geocode/json?sensor=false&region=TW&key=&address=%s', key, belong_address), function (error, response, body) {
                  if (!error && response.statusCode == 200) {
                    var rst = JSON.parse(body);

                    // upsert geocode
                    geocodes.update({'_id' : doc._id}, {$set: {'data' : rst} }, {w:1, upsert : true}, function (err) {
                        if (err) {
                            console.warn(err.message);
                        }
                        else {
                            console.log(doc.case_name + ' geocode is successfully updated');                        
                        }
                    });

                    // update doc location and random
                    var rst = JSON.parse(body);
                    if(rst.results[0] !== undefined) {
                        // give doc a random value
                        doc.random = Math.random();

                        //doc.location=[rst.results[0].geometry.location.lat, rst.results[0].geometry.location.lng];
                        //doc.location=rst.results[0].geometry.location;
                        doc.location={'lng': rst.results[0].geometry.location.lng, 'lat': rst.results[0].geometry.location.lat};
                        places.save(doc, {w:1}, function (err) {
                            if (err) {
                                console.warn(err.message);
                            }
                            else {
                                console.log(doc.case_name + ' is successfully updated');    
                            }
                        });
                    }
                  }
                });
            }, count * 500);
            //db.places.find({ loc : { $within : { $box : [[-122.167969, 37.353784], [-121.891937, 37.524975]] } } })
            //db.places.find({ location : { $within : { $centerSphere : [ {"lng" : 121.5154297, "lat" : 25.0731504 }, 14.5 / 6371 ] } } })
        }
    });    
});