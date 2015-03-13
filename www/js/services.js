angular.module('starter.services', [])

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])


.factory('Categories',['$http','PARSE_CREDENTIALS','$window', 'DB',function($http,PARSE_CREDENTIALS,$window, DB){
    var self = this;
    self.lastSync = '2013-03-07T11:35:46.622Z';
    self.syncing = 0;



        self.remoteSync = function(){
            if (self.syncing == 1)
                return;

            self.syncing = 1;
            return $http.get('https://api.parse.com/1/classes/categories',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                    'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
                params:  { 
                    where: '{"updatedAt":{"$gte":{"__type":"Date","iso":"' + self.lastSync + '"}}}',
                    order: '-date',
                    //limit: 2,
                    // count: 1
                    //'include': 'categoryID, owner'
                }
            }).success(function(data){
                var queryD = "delete from categories where objectId = '?'";
                var queryI = "insert into categories (objectId,budget,icon,name,shared,createdAt,updatedAt,status,deleted) values (?,?,?,?,?,?,?,'S',?)";
                if (!!data.results)
                    data = data.results;
                var tmpData = [];
                for(var idx = 0; idx < data.length; idx++){
                    tmpData.push([data[idx].objectId, data[idx].budget, data[idx].icon, data[idx].name, data[idx].shared, data[idx].createdAt, data[idx].updatedAt,data[idx].deleted]);
                }
                            
                var bindingsArray = typeof tmpData !== 'undefined' ? tmpData : [];
         
                DB.db.transaction(
                    function(transaction) {
                        for (var i=0; i<bindingsArray.length; i++){ 
                            queryD = "delete from categories where objectId = '" + bindingsArray[i][0] + "'";
                            console.log(queryD);
                            transaction.executeSql(queryD);
                        };
                    },
                    function(error){
                        self.syncing = 0;
                        console.log(error);
                    },
                    function(){
                        DB.db.transaction(
                            function(innertransaction) {
                                for (var idx=0; idx<bindingsArray.length; idx++){ 
                                    innertransaction.executeSql(queryI, bindingsArray[idx]);
                                };
                            },
                            function(error){
                                self.syncing = 0;
                                console.log("error inserting cqategories:");
                                console.log(error);
                            },
                            function(){
                                var d = new Date();
                                self.lastSync = d.toISOString();
                                console.log("successfully synced Categories at " + self.lastSync);
                                self.syncing = 0;
                            }
                        )

                    }
                );

            });
        };



       self.getAll=function(){
            return DB.query("SELECT * FROM categories").then(function(result){
                return DB.fetchAll(result);
            });
        };
        self.getFull=function(){
            return DB.query("SELECT categories.objectId, categories.budget, categories.icon, categories.NAME, categories.shared, categories.createdAt, categories.updatedAt, categories.OWNER, SUM(expense.value) AS used FROM categories INNER JOIN expense ON expense.categoryId = categories.objectId GROUP BY categories.objectId, categories.budget, categories.icon, categories.NAME, categories.shared, categories.createdAt, categories.updatedAt, categories.owner").then(function(result){
                return DB.fetchAll(result);
            });
            /*return $http.post('https://api.parse.com/1/functions/categoriesFull',{},{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                }
            });*/
        };
        self.get=function(id){
            return DB.query("SELECT * FROM categories where objectId = '" + id + "'").then(function(result){
                return DB.fetchAll(result);
            });
        };
        self.create=function(data){
            return $http.post('https://api.parse.com/1/classes/categories',data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        };
        self.edit=function(id,data){
            return $http.put('https://api.parse.com/1/classes/categories/'+id,data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        };
        self.delete=function(id){
            return $http.delete('https://api.parse.com/1/classes/categories/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        }
    
    return self;

}]).value('PARSE_CREDENTIALS',{
    APP_ID: "WbAXovOrZQo9Mxr7TtPOXsxPuofZ0R8FEaW7qrTt",
    REST_API_KEY:"ZKeAoTzFyB7pa5Ar0PLhMrQXK3ynqw1ThXOh5Zzn"
})


.factory('ExpensesOld',['$http','PARSE_CREDENTIALS','$window',function($http,PARSE_CREDENTIALS,$window){
    return {
        getAll:function(){
            return $http.get('https://api.parse.com/1/classes/expenses',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
				params:  { 
		            //where: whereQuery,
					order: '-date',
		            //limit: 2,
		            // count: 1
			   		'include': 'categoryID, owner'
	            }
            });
        },
		
        getMine:function(){
            return $http.get('https://api.parse.com/1/classes/expenses',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
				params:  { 
		            where: {"owner":{"__type":"Pointer","className":"_User","objectId":$window.localStorage['objectId']}},
					order: '-date',
		            //limit: 2,
		            // count: 1
			   		'include': 'categoryID'
	            }
            });
        },		
		
        getAllByCatId:function(categoryId){
            return $http.get('https://api.parse.com/1/classes/expenses',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
				params:  { 
		            where: {"categoryID":{"__type":"Pointer","className":"categories","objectId":categoryId}},
					order: '-date',
		            //limit: 2,
		            // count: 1
			   		'include': 'owner'
	            }
            });
        },

        get:function(id){
            return $http.get('https://api.parse.com/1/classes/expenses/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
				params:  { 
	                 //where: whereQuery,
	                 //limit: 2,
	                 // count: 1
					'include': 'categoryID, owner'
              }
            });
        },
        create:function(data){
            return $http.post('https://api.parse.com/1/classes/expenses',data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        },
        edit:function(id,data){
            return $http.put('https://api.parse.com/1/classes/expenses/'+id,data,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        },
        delete:function(id){
            return $http.delete('https://api.parse.com/1/classes/expenses/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN'],
                    'Content-Type':'application/json'
                }
            });
        }
    }
}]).value('PARSE_CREDENTIALS',{
    APP_ID: "WbAXovOrZQo9Mxr7TtPOXsxPuofZ0R8FEaW7qrTt",
    REST_API_KEY:"ZKeAoTzFyB7pa5Ar0PLhMrQXK3ynqw1ThXOh5Zzn"

})



.factory('Users',['$http','PARSE_CREDENTIALS','$window',function($http,PARSE_CREDENTIALS,$window){
    return {
        login:function(user){
            return $http.get('https://api.parse.com/1/login',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
                },	params:  {"username":user.username,"password":user.password}
            });
        },

		getFriendsRole:function(){
			return $http.get('https://api.parse.com/1/roles',{
				headers:{
					'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
					'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
				},
				params:  { 
					 where: {"name":"friendsOf_"+$window.localStorage['objectId']}
				}
			});
		},
		
		
		get:function(id){
			return $http.get('https://api.parse.com/1/users/'+id,{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
				params:  { 
	                 //where: {"$relatedTo":{"object":{"__type":"Pointer","className":"_Role","objectId":$window.localStorage['FRIENDS_ROLE_ID']},"key":"users"}}
	                 //limit: 2,
	                 // count: 1
					//'include': 'categoryID, owner'
              }
            });
		},
		
		getFriends:function(){
			return $http.get('https://api.parse.com/1/users',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
				params:  { 
	                 where: {"$relatedTo":{"object":{"__type":"Pointer","className":"_Role","objectId":$window.localStorage['FRIENDS_ROLE_ID']},"key":"users"}}
	                 //limit: 2,
	                 // count: 1
					//'include': 'categoryID, owner'
              }
            });
		}
		
    }
}]).value('PARSE_CREDENTIALS',{
    APP_ID: "WbAXovOrZQo9Mxr7TtPOXsxPuofZ0R8FEaW7qrTt",
    REST_API_KEY:"ZKeAoTzFyB7pa5Ar0PLhMrQXK3ynqw1ThXOh5Zzn"
})

.factory('DB', function($q, DB_CONFIG) {
    var self = this;
    self.db = null;
 
    self.init = function() {
        // Use self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name}); in production
        self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);
 
        angular.forEach(DB_CONFIG.tables, function(table) {
            var columns = [];
 
            angular.forEach(table.columns, function(column) {
                columns.push(column.name + ' ' + column.type);
            });
 
            var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
            self.query(query);
            console.log (query);
            console.log('Table ' + table.name + ' initialized');
        });
    };
 
    self.query = function(query, bindings) {
        bindings = typeof bindings !== 'undefined' ? bindings : [];
        var deferred = $q.defer();
 
        self.db.transaction(function(transaction) {
            transaction.executeSql(query, bindings, function(transaction, result) {
                deferred.resolve(result);
            }, function(transaction, error) {
                console.log(error);
                deferred.reject(error);
            });
        });
 
        return deferred.promise;
    };
	
	self.insert = function(query, bindingsArray) {
        bindingsArray = typeof bindingsArray !== 'undefined' ? bindingsArray : [];
        var deferred = $q.defer();
 
        self.db.transaction(
			function(transaction) {
				for (var i=0; i<bindingsArray.length; i++){  
					transaction.executeSql(query, bindingsArray[i]);
				};
			},
			function(error){
				console.log(error);
			},
			function(){
				console.log("transaction ok")
			}
		);
        return deferred.promise;
    };
 
    self.fetchAll = function(result) {
        var output = [];
 
        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }
        
        return output;
    };
 
    self.fetch = function(result) {
        return result.rows.item(0);
    };
 
    return self;
})
// Resource service example
.factory('Document', function(DB) {
    var self = this;
    
    self.all = function() {
        return DB.query('SELECT * FROM documents')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };
    
    self.getById = function(id) {
        return DB.query('SELECT * FROM documents WHERE id = ?', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };
    
    return self;
})
.factory('Expenses',['$http','PARSE_CREDENTIALS','$window','DB',function($http,PARSE_CREDENTIALS,$window,DB){
	var self = this;
    self.lastSync = '2013-03-07T11:35:46.622Z';
	self.syncing = 0;


        self.remoteSync = function(){
            if (self.syncing == 1)
                return;

			self.syncing = 1;
            return $http.get('https://api.parse.com/1/classes/expenses',{
                headers:{
                    'X-Parse-Application-Id': PARSE_CREDENTIALS.APP_ID,
                    'X-Parse-REST-API-Key':PARSE_CREDENTIALS.REST_API_KEY,
					'X-Parse-Session-Token': $window.localStorage['SESSION_TOKEN']
                },
				params:  { 
		            where: '{"updatedAt":{"$gte":{"__type":"Date","iso":"' + self.lastSync + '"}}}',
					order: '-date',
		            //limit: 2,
		            // count: 1
			   		'include': 'owner'
	            }
            }).success(function(data){
				var queryD = "delete from expense where objectId = '?'";
				var queryI = "insert into expense (objectId,categoryId,date,note,photo,value,createdAt,updatedAt,owner, owner_img, owner_username, owner_email, status, deleted) values (?,?,?,?,?,?,?,?,?,?,?,?,'S',?)"
				if (!!data.results)
					data = data.results;
				var tmpData = [];
				for(var idx = 0; idx < data.length; idx++){
					tmpData.push([data[idx].objectId, data[idx].categoryID.objectId, data[idx].date, data[idx].note, data[idx].photo, data[idx].value, data[idx].createdAt, data[idx].updatedAt, data[idx].owner.objectId, data[idx].owner.img, data[idx].owner.username, data[idx].owner.email,data[idx].deleted]);
				}


				var bindingsArray = typeof tmpData !== 'undefined' ? tmpData : [];
		 
				DB.db.transaction(
					function(transaction) {
						for (var i=0; i<bindingsArray.length; i++){ 
                            queryD = "delete from expense where objectId = '" + bindingsArray[i][0] + "'";
                            console.log(queryD);
							transaction.executeSql(queryD);
						};
					},
					function(error){
						self.syncing = 0;
						console.log(error);
					},
					function(){
                        DB.db.transaction(
                            function(innertransaction) {
                                for (var idx=0; idx<bindingsArray.length; idx++){ 
                                    innertransaction.executeSql(queryI, bindingsArray[idx]);
                                };
                            },
                            function(error){
                                self.syncing = 0;
                                console.log("error inserting expenses");
                                console.log(error);
                            },
                            function(){
                                var d = new Date();
                                self.lastSync = d.toISOString();
                                console.log("successfully synced expenses at " + self.lastSync);
                                self.syncing = 0;
                            }
                        )

					}
				);
				
				
				
				
				
				/*DB.insert(query,tmpData).then(function(result){
					//return DB.fetchAll(result);
					var d = new Date();
					self.lastSync = d.toISOString();
					console.log("successfully synced at " + self.lastSync);
				});
				for(var idx = 0; idx < data.length; idx++){
					query += "('" + data[idx].objectId + "','" + data[idx].categoryID.objectId + "','" + data[idx].date + "','"  + data[idx].note + "','" + data[idx].photo + "','" + data[idx].value + "','" + data[idx].createdAt + "','" + data[idx].updatedAt  + "','" + data[idx].owner.objectId + "'), ";
				}
				query = query.substr(0,query.length-2);
				return DB.query(query).then(function(result){
					//return DB.fetchAll(result);
					console.log(result);
				});*/
			});
        };
        self.getAll = function(){
            return DB.query("SELECT expense.*,categories.objectId AS categoryID_objectId,categories.budget AS categoryID_budget, categories.icon AS categoryID_icon, categories.name AS categoryID_name, categories.shared AS categoryID_shared, categories.createdAt AS categoryID_createdAt, categories.updatedAt AS categoryID_updatedAt FROM categories INNER JOIN expense ON expense.categoryId = categories.objectId where expense.deleted != '1'").then(function(result){
                return DB.fetchAll(result);
            });
        };		
        self.getMine = function(){
            return DB.query("SELECT expense.*,categories.objectId AS categoryID_objectId,categories.budget AS categoryID_budget, categories.icon AS categoryID_icon, categories.name AS categoryID_name, categories.shared AS categoryID_shared, categories.createdAt AS categoryID_createdAt, categories.updatedAt AS categoryID_updatedAt FROM categories INNER JOIN expense ON expense.categoryId = categories.objectId where expense.deleted != '1' AND expense.owner = '" + $window.localStorage['objectId'] + "'").then(function(result){
				return DB.fetchAll(result);
			});
        };		
		
        self.getAllByCatId = function(categoryId){
            return DB.query("SELECT expense.*,categories.objectId AS categoryID_objectId,categories.budget AS categoryID_budget, categories.icon AS categoryID_icon, categories.name AS categoryID_name, categories.shared AS categoryID_shared, categories.createdAt AS categoryID_createdAt, categories.updatedAt AS categoryID_updatedAt FROM categories INNER JOIN expense ON expense.categoryId = categories.objectId where expense.deleted != '1' AND expense.categoryID = '" + categoryId + "'").then(function(result){
                return DB.fetchAll(result);
            });
        };

        self.get = function(id){
            return DB.query("SELECT expense.*,categories.objectId AS categoryID_objectId,categories.budget AS categoryID_budget, categories.icon AS categoryID_icon, categories.name AS categoryID_name, categories.shared AS categoryID_shared, categories.createdAt AS categoryID_createdAt, categories.updatedAt AS categoryID_updatedAt FROM categories INNER JOIN expense ON expense.categoryId = categories.objectId where expense.deleted != '1' AND expense.objectId = '" + id + "'").then(function(result){
                return DB.fetchAll(result);
            });
        };
        self.create = function(data){

            var d = new Date();
            var tmpDate = d.toISOString();
            return DB.query(
                 "insert into expense (objectId,categoryId,date,note,photo,value,createdAt,updatedAt,owner, owner_img, owner_username, owner_email, status, deleted) values (?,?,?,?,?,?,?,?,?,?,?,?,'N','0')",
                ["FAKE_" + Date.now().toString() , data.categoryID_objectId, data.date.toISOString(), data.note, data.photo, data.value, tmpDate, tmpDate, $window.localStorage['objectId'], $window.localStorage['img'], $window.localStorage['username'], $window.localStorage['email']]
                ).then(function(result){
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
            return DB.query(
                 'update expense set categoryId = ?, date = ?, note = ?, photo = ?, value = ?, createdAt = ?, updatedAt = ?, status = "M" where objectId = ?',
                [data.categoryID.objectId, data.date.toISOString(), data.note, data.photo, data.value, data.createdAt, data.updatedAt, id]
                ).then(function(result){
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
            return DB.query(
                 "update expense set deleted = '1', status = 'M' where objectId = ?",
                [id]
                ).then(function(result){
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

