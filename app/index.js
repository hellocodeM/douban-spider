var spider = require("./spider");
var fs = require("fs");
var Log = require("log"),
	log = new Log("info", fs.createWriteStream('log/bootstrap.log'));

var config = {
	tag: "喜剧",
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
		interval: 3000
	};
	spider.start(option, function(data) {
		for (i in data) {
			console.log(data[i]);
			save(data[i].mid + "," + data[i].uid + "," + data[i].score + "\n");
		}
	});
});

function save(data) {
	fs.appendFile("data/data.csv", data, "utf-8", function(err) {
		if (err)
			log.error(err);
	});
}
