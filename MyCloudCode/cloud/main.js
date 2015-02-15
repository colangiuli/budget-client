
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.define("categoriesFull", function(request, response) {
	var query = new Parse.Query("expenses");
	  query.ascending("categoryID");
	  query.include(["categoryID"]);
	  query.find({
	    success: function(results) {
		 //first reorder the array;
		function compare(a,b) {
		  if (a.get("categoryID").id < b.get("categoryID").id)
		     return -1;
		  if (a.get("categoryID").id > b.get("categoryID").id)
		    return 1;
		  return 0;
		}

		results.sort(compare);

	      var tmpResult = [];
		  var parsedObj = [];
		  var sum = 0
		  var currentCategory = results[0].get("categoryID").id;
		  parsedObj.push(currentCategory);
	      for (var i = 0; i < results.length; i++) {
			if (results[i].get("categoryID").id == currentCategory){
	      		sum += parseFloat(results[i].get("value"));
	   	  	}else{
	   	  		tmpCat = results[i-1].get("categoryID");
				tmpResult.push({
					"objectId": currentCategory, 
					"name":tmpCat.get("name"),
					"budget":tmpCat.get("budget"),
					"icon":tmpCat.get("icon"),
					"shared":tmpCat.get("shared"),
					"used":sum.toFixed(2),
					"createdAt":tmpCat.createdAt,
					"updatedAt":tmpCat.updatedAt
				});
				sum = parseFloat(results[i].get("value"));
				currentCategory = results[i].get("categoryID").id;
				parsedObj.push(currentCategory);
	      	}
	      }//fine for
		  	tmpCat = results[i-1].get("categoryID");
			tmpResult.push({
				"objectId": currentCategory, 
				"name":tmpCat.get("name"),
				"budget":tmpCat.get("budget"),
				"icon":tmpCat.get("icon"),
				"shared":tmpCat.get("shared"),
				"used":sum.toFixed(2),
				"createdAt":tmpCat.createdAt,
				"updatedAt":tmpCat.updatedAt
			});
			parsedObj.push(currentCategory);
			//console.log(tmpResult); 

			var query2 = new Parse.Query("categories");
		  	query2.ascending("name");
			query2.notContainedIn("objectId",parsedObj);
		  	query2.find({
		    success: function(tmpResult, results2) {
				for (var idx = 0; idx < results2.length; idx++) {
					tmpCat = results2[idx];
					tmpResult.push({
						"objectId": tmpCat.id, 
						"name":tmpCat.get("name"),
						"budget":tmpCat.get("budget"),
						"icon":tmpCat.get("icon"),
						"shared":tmpCat.get("shared"),
						"used":"0,00",
						"createdAt":tmpCat.createdAt,
						"updatedAt":tmpCat.updatedAt
					});
				}	
				//console.log(results2); 
				//console.log(tmpResult);   
				response.success(tmpResult);
		    }.bind(this, tmpResult),	
			error: function() {
			      response.error("categories lookup failed");
			}
		  }); 

	    },
	    error: function() {
	      response.error("categories lookup failed");
	    }
	  });


});
