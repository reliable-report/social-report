'use strict';

const hash = window.location.hash.substring(1),
      splitted = hash.split("/"),
      pageId = splitted[0],
      request = splitted[1],
      MONTHS = ['January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'];

console.log(splitted);

let handler;

class Facebook {
    constructor(accessToken){
	this.accessToken = accessToken;
	this.jobs = {};
    }

    metadata(id,options,cb){
	FB.api(
	    id,
	    options.method || 'GET',
	    _.extend(options, {
		metadata: 1,
		access_token: this.accessToken
	    }),
	    (response) => {
		if(_.isFunction(cb)){
		    cb(response);
		}
	    });	
    }

    get(id, req, options, cb){
	FB.api(
	    [id, req].join(),
	    options.method || 'GET',
	    _.extend(options, {
		access_token: this.accessToken
	    }),
	    (response) => {
		if(!response || response.error){
		    if(_.isFunction(options.fail))
			options.fail(response.error);
		} else {
		    console.log(response);
		    if(_.isUndefined(this.jobs[req])){
			this.jobs[req] = [];
		    };
		    _.size(response.data) && this.jobs[req].push(response.data);
		    if(response.paging && response.paging.next){
			_.each(new URL(response.paging.next).search.substring(1).split('&'),
			       (it) => {
				   var kv = it.split(/\=/);
				   options[kv[0]] = kv[1];
			       });
			//console.log(options);
			handler.get(id, req, options, cb);
		    } else {
			if(_.isFunction(cb)){
			    cb(_.reduce(this.jobs[req], (result, it) => { return result.concat(it); }));
			}
		    }
		}
	    }
	);
    }
};


// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', {
    'packages': ['corechart']
});

handler = new Facebook('CAACEdEose0cBABImpJm0vUmfdqMrCfwMtGe5N8iZCwgUaCmWXLSZApjCs2GmwvsZAcYwMEZAsrlf3ziJ5ZAdDhLm9SyiEyK1bjUn3lKHRx9uRViQG59RJzwdh9QsqFwzCVbLXNoWD4YgWgCWl8KCi838ULueLVtsac7OJnvs6a089ea5dGtGQ97oGdtJjveY9wBB02ZAH0igZDZD');


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

const go = () => {
    // handler.metadata(pageId, {}, (response) => {
    // 	const fieldTypes = _(response.metadata.fields).map('type').uniq().value(),
    // 	      fieldNames = _(response.metadata.fields).map('name').value();

    // 	document.fields = response.metadata.fields;
    // 	document.fieldTypes = fieldTypes;
    // 	document.fieldNames = fieldNames;

    // 	console.log(response.metadata.fields, fieldTypes, fieldNames);
    // 	handler.get(pageId, '', {}, (response) => {
    // 	});	
    // });
    handler.get(pageId, '/posts', {
	since: new Date('2015/01/01').getTime() / 1000,
	limit: 100
    }, (results) => {
	// var postingsByMonth = _.chain(results)
	//         .groupBy(function(it) {
	// 	    var d = new Date(it.created_time);
	// 	    return [MONTHS[d.getMonth()], d.getFullYear()].join('/');
	// 	})
	//         .map(function(it, key) {
	// 	    return [key,
	// 		    _.size(it)];
	// 	})
	//         .value();
	//const postingsByMonth = results;
	// Create the data table.
	console.log(results);
	var columns = [];
	columns = _(results)
	    .unzip()
	    .value();
	console.log(columns);
	
	var data = new google.visualization.DataTable();
	data.addRows(results);
	
	//data.addColumn('string', 'Months');
	//data.addColumn('number', 'Posts');

	// Instantiate and draw our chart, passing in some options.
	data.addRows(postingsByMonth);
	// Set chart options
	var options = {
	    title: 'Number of postings per month',
	    width: '80%',
	    height: 300
	};

	// Instantiate and draw our chart, passing in some options.
	var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
	chart.draw(data, options);
    });

}

//export default Facebook;
