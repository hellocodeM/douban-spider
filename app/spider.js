var req = require("request");
var cheerio = require("cheerio");
var colors = require("colors");
var fs = require("fs");
var Log = require("log"),
	log = new Log('info', fs.createWriteStream(Logger("log/spider.log")));

// task queue
var taskQ = [];

/**
 * desc: get information from an URL or a movie id, the cb will be invoked with the movie "mid, uid, score" array as the callback.
 */
var fetch = function (options, cb) {
	var url = "";
	var id = options.id;
	if (! options.url && options.id) {
		url = "http://movie.douban.com/subject/" + options.id + "/collections";
	}else if (options.url) {
		url = options.url;
	} else {
		log.error("no url specified.");
	}
	if (url)
		log.info("fetching: " + url);

	//start 
	req(url, function(err, res, body) {
		if (!err && res.statusCode == 200) {
			$ = cheerio.load(body);
			var data  = [];

			//user and comment 
			var all = $(".article #collections_tab .sub_ins table");
			all.each(function(i, elem) {
				var people = $(this).find(".pl2 a").attr('href');
				var comment = $(this).find('.pl span').attr('class');
				if (people && comment) {
					people = people.split('/')[4];
					comment = comment.slice(7, 8);
					data.push({
						mid: id,
						uid: people,
						score: parseInt(comment)
					});
				}
			})
			cb(data);
			//next page

			var nextpage = $(".article #collections_tab .paginator .next a").attr('href');
			if (nextpage != undefined)  {
				var start = nextpage.slice(nextpage.indexOf('=') + 1);
				start = parseInt(start);
				if (start <= 180) {
					taskQ.push({
						url: nextpage,
						id: nextpage.split("/")[4]
					});
				} 
			}
		} else {
			log.error(err);
		}
	});
}

/**
 * start the fetch infomation from URL precudure
 */

exports.start = function(options, cb, next) {
	var interval = options.interval || 5000;
	taskQ = taskQ.concat(options.IDs);

	var intervalID = setInterval(function() {
		if (taskQ.length != 0) {
			fetch(taskQ.pop(), cb);
		} else {
			clearInterval(intervalID);
			if (next)
				next(null);
		}
	}, interval);	
}

/** bootstrap: get movie ids from search page.
 *	when bootstrap precudure finished, call the "next" function
 */
exports.boot = function (options, next) {
	// configuration
	var pageLimit = options.pageLimit || 200;
	var tag = options.tag || "热门";
	var pageStart = options.pageStart || 0;
	var interval = options.interval || 2000;
	var sum = options.sum || 5000;

	var originURL = "http://movie.douban.com/j/search_subjects?type=movie" +
		"&tag=" + tag + 
		"&sort=" + "time" +
		"&page_limit=" + pageLimit;

	// variable
	var data = [];

	// start
	var intervalID = setInterval(function() {
		if (pageStart > sum) {
			clearInterval(intervalID);
			next(null, data);
		}
		var curURL = originURL + "&page_start=" + pageStart;
		log.info("fetchind: " + curURL);
		req(curURL, function(err, res, body) {
			if (!err && res.statusCode == 200) {
				var sub = JSON.parse(body).subjects;
				for (var i in sub) {
					data.push({
						id: sub[i].id
					});
				}
			} else {
				log.error(err);
			}
		});
		pageStart += pageLimit;
	}, interval);
}

function Logger(baseURI) {
	var index = 1;
	var URL = baseURI;
	while (fs.existsSync(URL)) {
		URL = baseURI + index;
		index++;
	}
	return URL;
}

exports.save = function (data) {
	fs.appendFile("data/data.csv", data, "utf-8", function(err) {
		if (err)
			log.error(err);
	});
}
