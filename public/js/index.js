'use strict';

let a = 1;
var hash = window.location.hash.substring(1),
    splitted = hash.split("/"),
    pageId = splitted[0],
    request = splitted[1];

console.log(splitted);

var client = new Keen({
    projectId: "563889bd672e6c5b29c3617e", // String (required always)
    writeKey: "70e41a21424856bd16b6d3f9632e3e06a70d088db1cf6c787d19e91c9523e262ee8216aa0e1972b74d1853206d634aceab11e34efd24eaae2a722462e6d2beed0cfdfb6bcf7802d2fc594e3e27852a91095053a1db3597510c8dda282c2d4a7ba2b1004e38cd90cc1e5b3fbb8b8cc1a4", // String (required for sending data)
    readKey: "b5252395972cb7f027c68e6adbd864b3bff477a4015f7e1419859c60970454c8b243ac96467d984a05b25087f14c103ad665225309cb2ba06315282af272258492d96a2deb4604540a3b6bd6686a1ed832917af9e0cfcec4b2090aae568e963d7065b993ec3e8b2cdb2fa160e7cdf343", // String (required for querying data)

    //protocol: "https", // String (optional: https | http | auto)
    //host: "api.keen.io/3.0", // String (optional)
    //requestType: "jsonp" // String (optional: jsonp, xhr, beacon)
});

const FacebookHandler = function(accessToken) {
    var _self,
	results = [];

    return _self = {
	feed: function(id, options) {
	    FB.api(
		id + "/" + request,
		options.method || 'GET',
		_.extend(options, {
		    access_token: accessToken
		}),
		function(response) {
		    if (!response || response.error) {
			options.fail(response.error);
		    } else {
			console.log(response);

			var event = {
			    "d": _.each(response.data, function(it) {
				it.pageId = id;
				if (it.created_time)
				    it.keen = {
					timestamp: new Date(it.created_time).toISOString()
				    }
			    })
				};

			event[request] = event.d;
			delete event.d;

			client.addEvents(event, function(err, res) {
			    if (err) {
				console.log(err)
			    } else {
				console.log('Event transfer completed', res);
			    }
			});
			_.size(response.data) && results.push(response.data);
			console.log(_.size(results));
			if (response.paging && response.paging.next) {
			    _.each(new URL(response.paging.next).search.substring(1).split('&'),
				   function(it) {
				       var kv = it.split(/\=/);
				       options[kv[0]] = kv[1];
				   });
			    _self.feed(id, options);
			} else if (_.isFunction(options.success)) {
			    options.success(_.reduce(results, function(result, it) {
				return result.concat(it)
			    }));
			}
		    }
		}
	    )
	}
    }
}
// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {
    'packages': ['corechart']
});

var handler = new FacebookHandler('CAACEdEose0cBAHCPODHPt9TSv1WfdQXVaRdmArIeyyhlQBCcmc56B4Wzloq4zJPH0Y8c2V5QpepMbPCDIHNVxD6iMHqrNYXzR3CdIp3BfWBEjJtIdG7Qhe4aHtAh8yXfS4LfhePB1cZCZA4kRNoLMx1opXZC1QzfrlXyZBTczS09FbFrZCw2LYwpFENa33G7pZBPTgN2tqAgZDZD');

window.fbAsyncInit = function() {
    FB.init({
	appId: 'socibo.co',
	xfbml: true,
	version: 'v2.5'
    });

    google.setOnLoadCallback(go);
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
	return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

var go = function() {
    handler.feed('/' + pageId, {
	since: new Date("2015/01/01").getTime() / 1000,
	limit: 100,
	success: function(results) {
	    console.log(results);
	    var months = _.chain(results)
	        .groupBy(function(it) {
		    var d = new Date(it.created_time);
		    return d.getFullYear() + '-' + d.getMonth();
		})
	        .map(function(it, key) {
		    return [key, _.size(it)]
		})
	        .value();
	    // Create the data table.
	    var data = new google.visualization.DataTable();
	    data.addColumn('string', 'Months');
	    data.addColumn('number', 'Posts');

	    // Instantiate and draw our chart, passing in some options.
	    console.log(results, months);
	    data.addRows(months);
	    // Set chart options
	    var options = {
		'title': 'Number of postings per month',
		'width': '80%',
		'height': 300
	    };

	    // Instantiate and draw our chart, passing in some options.
	    var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
	    chart.draw(data, options);
	},
	fail: function(error) {
	    console.log(error);
	}
    });

}
  // Set a callback to run when the Google Visualization API is loaded.
