/**
 * New node file
 */

exports.insert = function(req, res) {
	console.log(req.body);
	var uid = req.param('uid', req.body.uid);
	var pid = req.param('pid', req.body.pid);
	var score = req.param('score', req.body.score);

	var db = req.db;
	var collection = db.get('scores');

	collection.insert({
		'uid' : uid,
		'pid' : pid,
		'score' : Number(score),
		'createdate' : new Date()
	}, function(e) {
		if (e) {
			res.send({
				'status' : 'error',
				'msg' : 'failed to insert.'
			});
		} else {
			res.send({
				'status' : 'ok'
			});
		}
	});
};

exports.list = function(req, res) {
	var uid = req.param('uid', null);

	var db = req.odb;
	var collection = db.collection('scores');
	var mine = [];
	var world = [];

	db.open(function(err, db) {

		// user
		collection.aggregate([ {
			$match : {
				'uid' : uid
			}
		}, {
			'$group' : {
				'_id' : {
					'uid' : '$uid',
					'pid' : '$pid'
				},
				'score' : {
					'$max' : '$score'
				}
			}
		}, {
			'$group' : {
				'_id' : '$_id.uid',
				'score' : {
					'$sum' : '$score'
				}
			},

		} ], function(e, docs) {
			mine = docs;

			// world
			collection.aggregate([ {
				'$group' : {
					'_id' : {
						'uid' : '$uid',
						'pid' : '$pid'
					},
					'score' : {
						'$max' : '$score'
					}
				}
			}, {
				'$group' : {
					'_id' : '$_id.uid',
					'score' : {
						'$sum' : '$score'
					}
				}
			}, {
				'$sort' : {
					'score' : -1
				}
			}, {
				'$limit' : 10
			} ], function(e, docs) {
				world = docs;
				res.send({
					'mine' : mine,
					'world' : world
				});
				db.close();
			});
		});

	});

	// res.send({
	// 'status' : 'ok'
	// });
};
