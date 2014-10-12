var spider = require("./spider");
var fs = require("fs");
var Log = require("log"),
	log = new Log("info", fs.createWriteStream('log/bootstrap.log'));

var config = {
	tag: "励志",
	interval: 2000,
	sum: 2000,
	pageLimit: 100
};

var IDs = [];

spider.boot(config, function(data) {
	IDs = IDs.concat(data);
}, function() {
	var option = {
		IDs: IDs,
		interval: 2000
	};
	spider.start(option, function(data) {
		for (i in data) {
			console.log(data[i]);
			spider.save(data[i].mid + "," + data[i].uid + "," + data[i].score + "\n");
		}
	});
});

