angular.module('starter.services', [])




.factory('Expenses',['$http','PARSE_CREDENTIALS','$window','DB','$rootScope',function($http,PARSE_CREDENTIALS,$window,DB,$rootScope){
	var self = this;

	self.syncing = 0;


        self.localSync = function(){

            console.log("exp: entering localSync");
            if(self.syncing != 0){
                console.log("exp: already syncing - exityng localsync current state: " + self.syncing);
                return;
            }else{
                self.syncing = 1;
                console.log("exp: sync 1");
            }
            console.log("exp: getting modified local data");
            DB.query("SELECT expense.*, categories.shared FROM expense inner join categories on expense.categoryId = categories.objectId where expense.status != 'S'").then(function(result){
                if (result.rows.length == 0){
                   console.log("exp: no more local data to sync");
                   console.log("exp sync 2");
                   self.syncing = 2;
                   self.remoteSync();
                   return; 
                }
                console.log("exp: " + result.rows.length + " rows to sync");
                
                var Requests = [];
                for (var idx = 0;idx < result.rows.length; idx++)
                {    
                        var riga = result.rows.item(idx);
                        var newExpense = {};
                        if(riga.objectId.substr(0,4) == "FAKE"){
                            newExpense.method = "POST";
                            newExpense.path = "/1/classes/expenses";
                        }else{
                            newExpense.method = "PUT";
                            newExpense.path = "/1/classes/expenses/"+riga.objectId,newExpense;
                        }
                        
                        newExpense.body.date = riga.date;
                        newExpense.body.note = riga.note;
                        newExpense.body.photo = riga.photo;
                        newExpense.body.value = riga.value;
                        newExpense.body.deleted = riga.deleted;
                        newExpense.body.shared = false;
                        //-----------ACL
                        newExpense.body.ACL = {};
                        newExpense.body.ACL[$window.localStorage['objectId']] = { "read": true, "write": true};
                        if (riga.shared == 'true'){
                            newExpense.body.shared = true;
                            newExpense.body.ACL["role:friendsOf_" + $window.localStorage['objectId']] = { "read": true};
                        }
                        newExpense.body.categoryID = {"__type": "Pointer", "className":"categories", "objectId": riga.categoryId};
                        newExpense.body.owner = {"__type": "Pointer", "className":"_User", "objectId": $window.localStorage['objectId'] };

                        console.log (newExpense);
                        Requests.push(newExpense);
                }  

                $http.post('https://api.parse.com/1/batch',{"requests": Requests},{
                    headers:{
                        'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                        'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                        'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                        'Content-Type':'application/json'
                    }
                }).success(function(data){
                   /* DB.query(
                         "update expense set status = 'S', objectId = ? where objectId = ?",
                        [data.objectId, riga.objectId]
                        ).then(function(result){
                            console.log("exp: " + riga.objectId + " synced. now it is: " + data.objectId);
                            console.log("exp: sync 0");
                            self.syncing = 0;
                            self.localSync();
                            return;
                    });*/
                console.log(data);
                }).error(function() {
                    console.log("error sending new expense " + riga.objectId + " to remote");
                    self.syncing = 0;
                    return;
                });






                      /*  if(riga.objectId.substr(0,4) == "FAKE"){
                            $http.post('https://api.parse.com/1/classes/expenses',newExpense,{
                                headers:{
                                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                                    'Content-Type':'application/json'
                                }
                            }).success(function(data){
                                DB.query(
                                     "update expense set status = 'S', objectId = ? where objectId = ?",
                                    [data.objectId, riga.objectId]
                                    ).then(function(result){
                                        console.log("exp: " + riga.objectId + " synced. now it is: " + data.objectId);
                                        console.log("exp: sync 0");
                                        self.syncing = 0;
                                        self.localSync();
                                        return;
                                });
                            }).error(function() {
                                console.log("error sending new expense " + riga.objectId + " to remote");
                                self.syncing = 0;
                                return;
                            });
                        }else{
                            newExpense.objectId = riga.objectId;
                            return $http.put('https://api.parse.com/1/classes/expenses/'+riga.objectId,newExpense,{
                                headers:{
                                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                                    'Content-Type':'application/json'
                                }
                            }).success(function(data){
                                DB.query(
                                     "update expense set status = 'S' where objectId = ?",
                                    [riga.objectId]
                                    ).then(function(result){
                                        console.log("exp: " + riga.objectId + " synced");
                                        console.log("exp: sync 0");
                                        self.syncing = 0;
                                        self.localSync();
                                        return;
                                });
                            }).error(function() {
                                console.log("error updating expense " + riga.objectId  + " to remote");
                                self.syncing = 0;
                                return;
                            });
                        }*/
                 
            });
            
        }
        self.remoteSync = function(){

            //if (!$window.localStorage['lastExpenseSync']){
               $window.localStorage['lastExpenseSync'] = '2013-03-07T11:35:46.622Z';
            //}
            console.log("exp Rem: entering remote sync");
            if (self.syncing != 2){
                console.log("exp Rem: status not = 2, it is " + self.syncing + " exiting");
                return;
            }else{
                console.log("exp Rem: sync 3");
    			self.syncing = 3;
            }
            console.log("exp Rem: getting remote data");



            DB.query("SELECT max(updatedAt) as lastSync from expense").then(function(result){
            if ( (result.rows.length == 0) || (result.rows.item(0).lastSync == null) ){
               console.log("exp sync: lastSync is empty, init");
               $window.localStorage['lastExpenseSync'] = '2013-03-07T11:35:46.622Z';
            }else{
                $window.localStorage['lastExpenseSync'] = result.rows.item(0).lastSync;
                console.log("cat sync: lastSync is " + $window.localStorage['lastExpenseSync'] );
            }

                return $http.get('https://api.parse.com/1/classes/expenses',{
                    headers:{
                        'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                        'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
    					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                    },
    				params:  { 
    		            where: '{"updatedAt":{"$gte":{"__type":"Date","iso":"' + $window.localStorage['lastExpenseSync']  + '"}}}',
    					order: '-date',
    		            //limit: 2,
    		            // count: 1
    			   		'include': 'owner'
    	            }
                }).success(function(data){
                    console.log("exp Rem: succesfully received remote data");
    				var queryD = "delete from expense where objectId = '?'";
    				var queryI = "insert into expense (objectId,categoryId,date,note,photo,value,createdAt,updatedAt,owner, owner_img, owner_username, owner_email, status, deleted) values (?,?,?,?,?,?,?,?,?,?,?,?,'S',?)"
    				if (!!data.results)
    					data = data.results;
    				var tmpData = [];
    				for(var idx = 0; idx < data.length; idx++){
    					tmpData.push([data[idx].objectId, data[idx].categoryID.objectId, data[idx].date, data[idx].note, data[idx].photo, data[idx].value, data[idx].createdAt, data[idx].updatedAt, data[idx].owner.objectId, data[idx].owner.img, data[idx].owner.username, data[idx].owner.email,data[idx].deleted]);
    				}


    				var bindingsArray = typeof tmpData !== 'undefined' ? tmpData : [];
    		        console.log("exp Rem: deleting local data");
    				DB.db.transaction(
    					function(transaction) {
    						for (var i=0; i<bindingsArray.length; i++){ 
                                queryD = "delete from expense where objectId = '" + bindingsArray[i][0] + "'";
                                console.log(queryD);
    							transaction.executeSql(queryD);
    						};
    					},
    					function(error){
                            console.log("exp Rem: error deleting local data");
                            console.log("exp Rem: sync 0");
    						self.syncing = 0;
    						console.log(error);
    					},
    					function(){
                            console.log("exp Rem: inserting remote data in db");
                            DB.db.transaction(
                                function(innertransaction) {
                                    for (var idx=0; idx<bindingsArray.length; idx++){ 
                                        innertransaction.executeSql(queryI, bindingsArray[idx]);
                                    };
                                },
                                function(error){
                                    console.log("exp Rem: error inserting remote data in db");
                                    console.log("exp Rem: sync 0");
                                    self.syncing = 0;
                                    console.log(error);
                                },
                                function(){
                                    var d = new Date();
                                    //$window.localStorage['lastExpenseSync']  = d.toISOString();
                                    console.log("exp Rem: succesfully inserted remote data in db");
                                    console.log("exp Rem: sync 0");
                                    console.log("exp Rem: successfully synced expenses at " + $window.localStorage['lastExpenseSync'] );
                                    $rootScope.$broadcast("syncFinished");
                                    self.syncing = 0;
                                }
                            )

    					}
    				);
    			}).error(function() {
                    console.log("exp Rem: error fetching expense data from remote");
                    console.log("exp Rem: sync 0");
                    self.syncing = 0;
                });
            });    
        };
        self.getAll = function(date){
            return DB.query("SELECT expense.*,categories.objectId AS categoryID_objectId,categories.budget AS categoryID_budget, categories.icon AS categoryID_icon, categories.name AS categoryID_name, categories.shared AS categoryID_shared, categories.createdAt AS categoryID_createdAt, categories.updatedAt AS categoryID_updatedAt FROM categories INNER JOIN expense ON expense.categoryId = categories.objectId where  strftime('%Y-%m', expense.date) = '"+date+"' and expense.deleted != '1'").then(function(result){
                return DB.fetchAll(result);
            });
        };		
        self.getMine = function(date){
            return DB.query("SELECT expense.*,categories.objectId AS categoryID_objectId,categories.budget AS categoryID_budget, categories.icon AS categoryID_icon, categories.name AS categoryID_name, categories.shared AS categoryID_shared, categories.createdAt AS categoryID_createdAt, categories.updatedAt AS categoryID_updatedAt FROM categories INNER JOIN expense ON expense.categoryId = categories.objectId where  strftime('%Y-%m', expense.date) >= '"+date+"' and expense.deleted != '1' AND expense.owner = '" + $window.localStorage['objectId'] + "' order by expense.date desc").then(function(result){
				return DB.fetchAll(result);
			});
        };		
		
        self.getAllByCatId = function(categoryId,date){
            return DB.query("SELECT expense.*,categories.objectId AS categoryID_objectId,categories.budget AS categoryID_budget, categories.icon AS categoryID_icon, categories.name AS categoryID_name, categories.shared AS categoryID_shared, categories.createdAt AS categoryID_createdAt, categories.updatedAt AS categoryID_updatedAt FROM categories INNER JOIN expense ON expense.categoryId = categories.objectId where  strftime('%Y-%m', expense.date) = '"+date+"' and expense.deleted != '1' AND expense.categoryID = '" + categoryId + "'").then(function(result){
                return DB.fetchAll(result);
            });
        };

        self.get = function(id){
            return DB.query("SELECT expense.*,categories.objectId AS categoryID_objectId,categories.budget AS categoryID_budget, categories.icon AS categoryID_icon, categories.name AS categoryID_name, categories.shared AS categoryID_shared, categories.createdAt AS categoryID_createdAt, categories.updatedAt AS categoryID_updatedAt FROM categories INNER JOIN expense ON expense.categoryId = categories.objectId where expense.deleted != '1' AND expense.objectId = '" + id + "'").then(function(result){
                return DB.fetchAll(result);
            });
        };
        self.create = function(data){
            console.log("Create: sync 0");
            self.syncing = 0;
            var d = new Date();
            var tmpDate = d.toISOString();
            return DB.query(
                 "insert into expense (objectId,categoryId,date,note,photo,value,createdAt,updatedAt,owner, owner_img, owner_username, owner_email, status, deleted) values (?,?,?,?,?,?,?,?,?,?,?,?,'N','0')",
                ["FAKE_" + Date.now().toString() , data.categoryID_objectId, data.date.toISOString(), data.note, data.photo, data.value, tmpDate, tmpDate, $window.localStorage['objectId'], $window.localStorage['img'], $window.localStorage['username'], $window.localStorage['email']]
                ).then(function(result){
                console.log("Delete: OK sync 0");
                self.syncing = 0;     
                return DB.fetchAll(result);
            });

            /*
            return $http.post('https://api.parse.com/1/classes/expenses',data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
             */
        };
        self.edit = function(id,data){
            console.log("Edit: sync 0");
            self.syncing = 0;
            return DB.query(
                 'update expense set categoryId = ?, date = ?, note = ?, photo = ?, value = ?, createdAt = ?, updatedAt = ?, status = "M" where objectId = ?',
                [data.categoryID.objectId, data.date.toISOString(), data.note, data.photo, data.value, data.createdAt, data.updatedAt, id]
                ).then(function(result){
                console.log("Edit: OK sync 0");
                self.syncing = 0;    
                return DB.fetchAll(result);
            });

                /*

            return $http.put('https://api.parse.com/1/classes/expenses/'+id,data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
*/
        };
        self.delete = function(id){
            console.log("Delete: sync 0");
            self.syncing = 0; 
            return DB.query(
                 "update expense set deleted = '1', status = 'M' where objectId = ?",
                [id]
                ).then(function(result){
                console.log("Delete: OK sync 0");
                self.syncing = 0; 
                return DB.fetchAll(result);
            });
            /*
            return $http.delete('https://api.parse.com/1/classes/expenses/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
            */
        };
		
		return self;
    
}]).value('PARSE_CREDENTIALS',{
    APP_ID: "WbAXovOrZQo9Mxr7TtPOXsxPuofZ0R8FEaW7qrTt",
    REST_API_KEY:"ZKeAoTzFyB7pa5Ar0PLhMrQXK3ynqw1ThXOh5Zzn"

});

