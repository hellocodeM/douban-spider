var spider = require("./spider");
var fs = require("fs");
var Log = require("log"),
	log = new Log("info", fs.createWriteStream('log/bootstrap.log'));
var async = require("async");

var config = {
	tags: ["青春", "热门", "历史", "恐怖", "犯罪", "儿童", "文艺", "美国", "中国"],
	interval: 2000,
	sum: 1000,
	pageLimit: 100
};


async.concatSeries(config.tags, function(item, callback) {
	var conf = {
		tag: item,
		interval: config.interval,
		sum: config.sum,
		pageLimit: config.pageLimit
	};
	spider.boot(conf, callback);
}, function(err, results) {
	var option = {
		IDs: results,
		interval: 2000
	};
	spider.start(option, function(data) {
		for (i in data) {
			console.log(data[i]);
			spider.save(data[i].mid + "," + data[i].uid + "," + data[i].score + "\n");
		}
	})
})
