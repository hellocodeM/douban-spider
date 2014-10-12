var spider = require("./spider");
var fs = require("fs");
var Log = require("log"),
	log = new Log("info", fs.createWriteStream('log/bootstrap.log'));

var config = {
	tag: "悬疑",
	interval: 2000,
	sum: 1000,
	pageLimit: 100
};

var IDs = [];

spider.boot(config, function(data) {
	var option = {
		IDs: data,
		interval: 2000
	};
	spider.start(option, function(data) {
		for (i in data) {
			console.log(data[i]);
			spider.save(data[i].mid + "," + data[i].uid + "," + data[i].score + "\n");
		}
	});
});

