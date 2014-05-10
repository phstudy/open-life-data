/*
 * GET users listing.
 */

exports.init = function(req, res) {
	var db = req.db;
	var collection = db.get('places');

	// cleanup
	collection.update({}, {
		$set : {
			subjects : []
		},
	}, {
		multi : true
	}, function(e) {
		res.send({
			'status' : 'error',
			'msg' : 'update error.'
		});
	});

	// set index on subjects
	collection.ensureIndex({
		'subjects' : 1
	});

	// data
	var map = {
		"愛與文化之旅" : [ "AA09706000049", "AA09602000709", "AA09602000037", "AA09705000080", "AA09706000048", "AA09602001085" ],
		"日據時代文化之旅" : [ "AA09602001077", "AA09602000842", "AA09706000064", "AA09706000066", "AA09602000837", "AA09705000061", "AA09705000062", "AA09705000063" ],
		"台灣本土文化之旅" : [ "AA09602000087", "AA09602000074", "AA10211000001" ]
	};

	for ( var key in map) {
		if (map.hasOwnProperty(key)) {
			map[key].forEach(function(id) {
				collection.update({
					'_id' : id
				}, {
					'$addToSet' : {
						'subjects' : key
					}
				}, function(e) {
					res.send({
						'status' : 'error',
						'msg' : '$addToSet error.'
					});
				});
			});
		}
	}
	res.send('init done.');
};

exports.list = function(req, res) {
	var uid = req.param('uid', null);

	var db = req.odb;
	var collection = db.collection('places');
	var scollection = db.collection('scores');
	db.open(function(err, db) {
		collection.aggregate([ {
			$match : {
				subjects : {
					$ne : []
				}
			}
		}, {
			'$unwind' : '$subjects'
		}, {
			'$group' : {
				'_id' : '$subjects',
				'places' : {
					'$addToSet' : {
						'_id' : '$_id',
						'case_name' : '$case_name',
						'location' : '$location'
					}
				}
			}
		} ], function(e, docs) {
			var c = 0;
			var cc = 0;
			if (uid === null) {
				res.send(docs);
				db.close();
			} else {
				for (var i = 0; i < docs.length; i++) {
					var subject = docs[i];
					for (var j = 0; j < subject.places.length; j++) {
						c++;
						var pid = subject.places[j]._id;

						var cursor = scollection.find({
							'pid' : pid,
							'uid' : uid
						});

						cc++;
						cursor.sort({
							"score" : -1
						}).limit(1).each(function(err, doc) {
							if (doc !== null) {
								console.log(doc);
								for (var x = 0; x < docs.length; x++) {
									var subject2 = docs[x];
									for (var k = 0; k < subject2.places.length; k++) {
										if (subject2.places[k]._id === doc.pid) {
											subject2.places[k].score = doc.score;
										}
									}
								}
								if (c === cc) {
									res.send(docs);
									db.close();
								}
							} else {
								if (c === cc) {
									res.send(docs);
									db.close();
								}
							}
						});
					}
				}
			}
		});
	});
};