$(document).ready(function() {
	// node.js modules
	path = require("path");
	fs = require("fs-extra");

	// joins full path and file which will pe opened
	var full_path = path.resolve(path.dirname(process.execPath), "lists.json");

	console.log("path: ");
	console.log(full_path);

	var json = readJson(full_path);
	console.log("json from file: ");
	console.log(json);

// 	var json = [
//   {
//     "ID": 0,
//     "name": "Project 1",
//     "items": [
//       {
//         "ID": 0,
//         "text": "test",
//         "date": 13685688,
//         "done": false
//       },
//       {
//         "ID": 1,
//         "text": "test blub",
//         "date": 13690008,
//         "done": true
//       },
//       {
//         "ID": 2,
//         "text": "test blub bla",
//         "date": 13694328,
//         "done": false
//       }
//     ]
//   },
//   {
//     "ID": 1,
//     "name": "Project 2",
//     "items": [
//       {
//         "ID": 0,
//         "text": "test blub bli",
//         "date": 13690008
//       }
//     ]
//   },
//   {
//     "ID": 2,
//     "name": "Project 3",
//     "items": []
//   }
// ]

	/*
	 *
	 * output if program first opened
	 *
	 */

	// get current and max date for form input
	var today = new Date();
	var currentMonth = today.getMonth() + 1;
	if (currentMonth < 10) { currentMonth = '0' + currentMonth; }
	date = (today.getFullYear() + "-" + currentMonth + "-" + today.getDate()).toString();
	maxDate = ((today.getFullYear()+2) + "-" + currentMonth + "-" + today.getDate()).toString();

	// output variable which will be appended after each loops
	var output = "";
	var urgent = "";
	// templates for easier change of html
	var listTemplate1 = "<li><div class='listHeader'>{{listName}}<button class='deleteList'><i class='icon-remove'></i></button></div><section><div><input type='hidden' value='{{listID}}'>";
	var itemTemplate1 = "<li class='{{itemClass}}'>{{itemText}}<button class='deleteItem'><i class='icon-remove'></i></button><button class='toggleDone'><i class='icon-ok'></i></button><input type='hidden' value='{{itemID}}'></li>";
	var itemTemplate2 = "<div class='status'><a class='showNotDone active' href='#'>notDone</a><a class='showDone' href='#'>done</a></div><ul class='listItems done'>{{done}}</ul><ul class='listItems notDone'>{{notDone}}</ul>"
	var listTemplate2 = "<div class='addItem'><input type='text' placeholder='item name'><button><i class='icon-ok'></i></button><input type='date' min='{{date}}' max='{{maxDate}}' value='{{date}}'></div></div></section></li>";
	var urgentTemplate = "<li class='{{itemClass}}'>{{itemText}}</li>";


	// loops through each list in lists
	$.each(json, function(idx, list) {
		
		var done = "";
		var notDone ="";
		// loops through each item in a given list
		$.each(list.items, function(idx, item) {
			if (item.done) {
				done += itemTemplate1.replace("{{itemClass}}", getClass(item.date, date)).replace("{{itemText}}", item.text).replace("{{itemID}}", item.ID);
			} else {
				if (getClass(item.date, date) == "red" && item.done == false) {
					urgent += urgentTemplate.replace("{{itemClass}}", getClass(item.date, date)).replace("{{itemText}}", item.text).replace("{{itemID}}", item.ID);
				}
				notDone += itemTemplate1.replace("{{itemClass}}", getClass(item.date, date)).replace("{{itemText}}", item.text).replace("{{itemID}}", item.ID);
			}
		});
		output += listTemplate1.replace("{{listName}}", list.name).replace("{{listID}}", list.ID);
		if (done == "" && notDone == "") {
			output += itemTemplate2.replace("{{done}}", "").replace("{{notDone}}", "") + "<div class='noListItems'>empty</div>";			
		} else {
			output += itemTemplate2.replace("{{done}}", done).replace("{{notDone}}", notDone);
		}
		output += listTemplate2.replace("{{date}}", date).replace("{{maxDate}}", maxDate).replace("{{date}}", date);
	});
	
	$(".urgent").append(urgent);
	$(".list").append(output);

	$(".done").hide();

	$(".container").on("click", ".status > a", function() {
		if ($(this).hasClass("showNotDone")) {
			$(this).addClass("active");
			$(this).siblings().removeClass("active");
			$(this).parent().siblings(".notDone").show();
			$(this).parent().siblings(".done").hide();
		} else if ($(this).hasClass("showDone")) {
			$(this).addClass("active");
			$(this).siblings().removeClass("active");
			$(this).parent().siblings(".done").show();
			$(this).parent().siblings(".notDone").hide();
		}
	});

	/*
	 *
	 * adds a new list at the end of the lists
	 *
	 */
	$(".container").on("click", ".addList", function() {
		if (json.length == 0) {
			var listID = 0;
		} else {
			var listID = getMax(json)+1;
		}
		console.log("max: " + json.length);
		var listName = $(this).prev().val();

		json = addList(json, listID, listName);

		writeJsonToFile(full_path, json);

		console.log(json);

		output = listTemplate1.replace("{{listName}}", listName).replace("{{listID}}", listID);
		output += ("<div class='status'><a class='showNotDone active' href='#'>notDone</a><a class='showDone' href='#'>done</a></div><ul class='listItems done'></ul><ul class='listItems notDone'></ul><div class='noListItems'>empty</div>");
		output += listTemplate2.replace("{{date}}", date).replace("{{maxDate}}", maxDate).replace("{{date}}", date);
		$(".list").append(output);

		// reset input field
		$(this).prev().val("");
	});

	/*
	 *
	 * adds a new item to current list
	 *
	 */
	$(".container").on("click", ".addItem button", function() {
		$(".listItems").children("li").removeClass("newItem");
		$(".urgent").children("li").removeClass("newItem");
		var listID = $(this).parent().siblings('input[type="hidden"]').val();
		var itemText = $(this).siblings('input[type="text"]').val();
		var itemDate = $(this).siblings('input[type="date"]').val();
		var timestamp = dateToTimestamp(itemDate);
		console.log("listID: " + listID);
		var index = sortIndex(json, listID, timestamp);
		var itemID = getMax(json[listID].items)+1;

		console.log("index: " + index);

		json = addItem(json, listID, itemID, itemText, timestamp, index);
		console.log(json);
		console.log("date: " + itemDate);
		writeJsonToFile(full_path, json);
		$(this).siblings('input[type="text"]').val("");

		$(this).parent().siblings(".noListItems").slideUp(200, function() {
			$(this).parent().siblings(".noListItems").remove();
		});

		if (index == -1) {
			$(this).parent().siblings(".notDone").append(itemTemplate1.replace("{{itemClass}}", "newItem " + getClass(timestamp, date)).replace("{{itemText}}", itemText).replace("{{itemID}}", itemID));
		} else {
			$(this).parent().siblings(".notDone").children("li:eq(" + index + ")").before(itemTemplate1.replace("{{itemClass}}", "newItem " + getClass(timestamp, date)).replace("{{itemText}}", itemText).replace("{{itemID}}", itemID));
		}

		if (getClass(timestamp, date) == "red") {
			$(".urgent").append(urgentTemplate.replace("{{itemClass}}", "newItem " + getClass(timestamp, date)).replace("{{itemText}}", itemText).replace("{{itemID}}", itemID));
		}

		$(".newItem").hide();
		$(".newItem").slideDown(200);

	});

	/*
	 *
	 * deletes a complete list with all its items
	 *
	 */
	$(".container").on("click", ".deleteList", function() {
		var ID = $(this).parent().next().children().children("input[type='hidden']").val();

		json = removeList(json, ID);
		writeJsonToFile(full_path, json);
		$(this).parent().parent("li").remove();

		// for debugging
		console.log(ID);
		console.log(json);
	});

	/*
	 *
	 * deletes the selected item
	 *
	 */
	$(".container").on("click", ".deleteItem", function() {
		var listID = $(this).parent().parent().siblings("input[type='hidden']").val();
		var itemID = $(this).next().val();

		json = removeItem(json,listID, itemID);
		writeJsonToFile(full_path, json);
		var remo = $(this).parent("li");
		remo.slideUp(200, function() {
			remo.remove();
		});
		
		// for debugging
		console.log(json);
	});

	/*
	 *
	 * toggles done state of selected item
	 *
	 */
	$(".container").on("click", ".toggleDone", function() {
		var listID = $(this).parent().parent().siblings("input[type='hidden']").val();
		var itemID = $(this).next().val();

		// for debugging
		console.log("listID" + listID + " itemID: " + itemID);
		console.log(json);

		json = toggleDone(json, listID, itemID);
		writeJsonToFile(full_path, json);

		var currentListItem = $(this).parent("li");
		var state = ".done";
		
		if (currentListItem.parent(".notDone").length) {
			state = ".done";
		} else {
			state = ".notDone";
		}

		console.log();

		currentListItem.fadeTo(200, 0, function() {
			currentListItem.slideUp(200, function() {
				currentListItem.show();
				currentListItem.css({"opacity": "1"});
				currentListItem.appendTo(currentListItem.parent().siblings(state));

			});
		});
		
	});	

	/*
	 *
	 * filters the list Items on keystroke
	 *
	 */
	$(".container").on("keyup", "#filter", function() {
	    var re = new RegExp($(this).val(), "i"); // "i" means it's case-insensitive
	    $(".listItems li").show().filter(function() {
	        return !re.test($(this).text());
	    }).hide();
	});

	$("section").hide();

	$(".options").hide();
	$(".container").on("click", ".listHeader", function() {
		if ($(this).hasClass("headerActive")) {
			$(this).removeClass("headerActive");
			$(this).next().slideUp(200);
		} else {
			$(".listHeader").removeClass("headerActive");
			$(this).addClass("headerActive");
			$(".listHeader").next(":visible").slideUp(200);
			$(this).next().slideDown(200);
		}
	});

	$(".container").on("click", "header button", function() {
		$(".options").slideToggle(200);
		$("header button").toggleClass("active");
	});


	$(".container").on("focus", ".addItem input", function() {
		$(this).parent().css({"border-color": "#1ABC9C"});
	});

	$(".container").on("focusout", ".addItem input", function() {
		$(this).parent().css({"border-color": "#D5D5D0"});
	});

	$(".container").on("focus", ".options input", function() {
		$(this).parent().css({"border-color": "#1ABC9C"});
	});

	$(".container").on("focusout", ".options input", function() {
		$(this).parent().css({"border-color": "#D5D5D0"});
	});
 });
