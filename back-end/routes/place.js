exports.init = function(req, res) {
	var db = req.db;
	var collection = db.get('places');

	// cleanup
	collection.update({}, {
		$set : {
			questions : []
		},
	}, {
		multi : true
	}, function(e) {
		res.send({
			'status' : 'error',
			'msg' : 'update error.'
		});
	});

	// data
	var map = {
		"AA09602000709" : [ {
			"question" : "公賣局球場是在什麼時候啟用的？",
			"options" : [ "1961年", "1942年", "1993年" ],
			"ans" : "1"
		}, {
			"question" : "公賣局球場可以容納多少人？",
			"options" : [ "250人", "10000人", "2500人" ],
			"ans" : "3"
		}, {
			"question" :"公賣局球場是用什麼材料建成？",
			"options" : [ "鋁", "黃金", "白鐵" ],
			"ans" : "1"
		}, {
			"question" :"公賣局球場是鋁料興建的大跨距建物？",
			"options" : [ "是", "否" ],
			"ans" : "1"
		} ],
		"AA09602000037" : [{
			"question" : "test",
			"options" : [ "選項1", "選項2", "選項3" ],
			"ans" : "1"
		}],
		"AA09705000080" :[ {
			"question" : "test",
			"options" : [ "選項1", "選項2", "選項3" ],
			"ans" : "1"
		}],
		"AA09706000048" : [{
			"question" : "test",
			"options" : [ "選項1", "選項2", "選項3" ],
			"ans" : "1"
		}],
		"AA09602001085" : [{
			"question" : "test",
			"options" : [ "選項1", "選項2", "選項3" ],
			"ans" : "1"
		}],
		"AA09602001077" : [{
			"question" : "test",
			"options" : [ "選項1", "選項2", "選項3" ],
			"ans" : "1"
		}],
		"AA09602000842" : [{
			"question" : "松山菸廠在日據時期稱為",
			"options" : [ "橘子工坊", "臺灣總督府專賣局松山煙草工場", "生活工廠" ],
			"ans" : "2"
		}],
		"AA09706000064" : [{
			"question" : "test",
			"options" : [ "選項1", "選項2", "選項3" ],
			"ans" : "1"
		}],
		"AA09706000066" : [{
			"question" : "test",
			"options" : [ "選項1", "選項2", "選項3" ],
			"ans" : "1"
		}],
		"AA09602000837" : [{
			"question" : "test",
			"options" : [ "選項1", "選項2", "選項3" ],
			"ans" : "1"
		}],
		"AA09705000061" : [{
			"question" : "test",
			"options" : [ "選項1", "選項2", "選項3" ],
			"ans" : "1"
		}],
		"AA09705000062" : [{
			"question" : "test",
			"options" : [ "選項1", "選項2", "選項3" ],
			"ans" : "1"
		}],
		"AA09705000063" : [{
			"question" : "test",
			"options" : [ "選項1", "選項2", "選項3" ],
			"ans" : "1"
		}],
		"AA09602000087" : [{
			"question" : "test",
			"options" : [ "選項1", "選項2", "選項3" ],
			"ans" : "1"
		}],
		"AA09602000074" : [{
			"question" : "test",
			"options" : [ "選項1", "選項2", "選項3" ],
			"ans" : "1"
		}],
		"AA10211000001" : [{
			"question" : "test",
			"options" : [ "選項1", "選項2", "選項3" ],
			"ans" : "1"
		}]
	};

	for ( var key in map) {
		if (map.hasOwnProperty(key)) {
			collection.update({
				'_id' : key
			}, {
				'$set' : {
					'questions' : map[key]
				}
			}, function(e) {
				res.send({
					'status' : 'error',
					'msg' : 'set error.'
				});
			});
		}
	}
	res.send('init done.');
};

/*
 * GET users listing.
 */

exports.list = function(req, res) {
	var lmt = req.param('limit', 100);
	var lat = req.param('lat', null);
	var lng = req.param('lng', null);
	var dis = req.param('distance', null); // km unit

	var db = req.db;
	var collection = db.get('places');
	var criteria = {};

	// ?lng=121.5154297&lat=25.0731504&distance=0.5&limit=100
	// db.places.find({ location : { $within : { $centerSphere : [ {"lng" :
	// 121.5154297, "lat" : 25.0731504 }, 14.5 / 6371 ] } } })

	if (lat !== null && lng !== null && dis !== null) {
		criteria = {
			'location' : {
				'$within' : {
					'$centerSphere' : [ {
						"lng" : Number(lng),
						"lat" : Number(lat)
					}, dis / 6371.0 ]
				}
			}
		};
	}

	collection.find(criteria, {
		limit : Number(lmt)
	}, function(e, docs) {
		res.send(docs);
	});
};