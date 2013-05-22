function removeList (lists, value) {
	var index = "";

	// cycle through json array and select each object in it
	$.each(lists, function(idx, list) {
		if(list.ID == value) {
			index = idx;
			console.log(index);
		}
	});

	lists.splice(index, 1);

	return lists;
}

function removeItem (lists, listID, value) {
	var index = "";

	// cycle through json array and select each object in it
	$.each(lists[listID].items, function(idx, item) {		
		
		if(item.ID == value) {
			index = idx;
			console.log(item.ID);
			console.log(index);
		}
		
	});

	lists[listID].items.splice(index, 1);

	return lists;
}

function toggleDone (lists, listID, itemID) {
	if (lists[listID].items[itemID].done) {
		lists[listID].items[itemID].done = false;
	} else {
		lists[listID].items[itemID].done = true;
	}

	return lists;
}

function getMax (lists) {
	var max = 0, maxIndex = -1;

	for(var i = 0; i < lists.length; i++) {
	   if(parseInt(lists[i].ID,10) > max) {
	      max = lists[i].ID;
	      maxIndex = i;
	   }
	}

	return max;
}

function dateToTimestamp (date) {
	date = date.split("-");
	var timestamp = new Date(parseInt(date[0]), parseInt(date[1]), parseInt(date[2])).getTime();

	return timestamp / 100000;
}

function sortIndex(lists, listID, timestamp) {
	var index = -1;

	// cycle through json array and select each object in it
	$.each(lists[listID].items, function(idx, item) {		
		
		if((item.date - timestamp) >= 0 ) {
			index = idx;
			console.log(item.date);
			console.log(timestamp);
		} else {
			index = -1;
			console.log(item.date);
			console.log(timestamp);
		}
		
	});

	return index;
}

function addItem (lists, listID, itemID, itemText, timestamp, index) {

	var itemToAdd = { ID: itemID, text: itemText, date: timestamp, done: false };

	if (index == -1) {
		lists[listID].items.push(itemToAdd);
	} else {
		lists[listID].items.splice(index, 0, itemToAdd);
	}

	return lists;
}

function addList (lists, listID, listName) {

	var listToAdd = { ID: listID, name: listName, items: [] };

	lists.push(listToAdd);

	return lists;
}

function getClass (itemDate, date) {
	date = dateToTimestamp(date);

	// 0 day between due date and today
	if ((itemDate - date) <= 0) {
		return "red";
	// 3 or less days between due date and today
	} else if ((itemDate - date) <= 2592) {
		return "yellow";
	} else {
		return "green";
	}
}

function readJson (full_path) {
	fs = require("fs");
	try {
		var json_array = JSON.parse(fs.readFileSync(full_path, "utf8"));
	} catch(e) {
		$(".log").append("Fehler");
	}

	return json_array;
}

function writeJsonToFile (full_path, json_array) {
	fs = require("fs-extra");
	fs.writeJson(full_path, json_array, function(err) {
		if(err) { errorHandler(err); }
		else { $(".log").append('<span class="notify">written string to projects.json</span>'); }
	});
}