angular.module('starter.controllers', [])


.controller('MainCtrl', function($scope, $localstorage, $stateParams, Expenses, Categories, $state, $ionicSlideBoxDelegate, $ionicModal, Users) {
		$scope.dateFormat = 'dd/MM/yyyy';
	//first we have to login
	Users.login();
	
///////////////////////////////////////////////////////
/////////      new expense handling
///////////////////////////////////////////////////////   	
	$ionicModal.fromTemplateUrl('templates/expense-add-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.editExpenseModalPage = modal
	})  

  $scope.createNewExpense = function() {
  	$scope.newExpense={};
	$scope.newExpense.date = new Date();
	$scope.newExpense.note = "--";
	$scope.newExpense.categoryID = {
		"__type": "Pointer",
		"className":"categories",
		"objectId": ""
	};
	$scope.newExpense.owner = {
		"__type": "Pointer",
		"className":"_User",
		"objectId": $localstorage.get('objectId')
	};
	$scope.newExpense.value = 0;
	$scope.fullString="000";
	$scope.strDotted = "0,00";
	$scope.show = "calc";
	
	Categories.getAll().success(function(data){
		var tmpArray = data.results;
		var elementXpage = 2;
		$scope.allCategories = data.results;
		$scope.newExpense.categoryID.objectId = tmpArray[0].objectId?tmpArray[0].objectId:0;
		var outputArray = Array();
		for (var idx = 0; idx < tmpArray.length; idx+=elementXpage){
			outputArray.push(tmpArray.slice(idx, idx+elementXpage));
		}
		$scope.categories = outputArray;
		$ionicSlideBoxDelegate.update();
	});
	
    $scope.editExpenseModalPage.show();
  }
  
    $scope.editExpense= function(expense) {
		$scope.newExpense = expense;
		$scope.strDotted = expense.value;
		$scope.newExpense.date = new Date($scope.newExpense.date);
	
		leftString = parseInt(expense.value.substr(0,expense.value.length-3)).toString();
		rightString = expense.value.substr(expense.value.length-2,2);
		$scope.fullString = leftString + rightString;
		$scope.newExpense.categoryID = {
		    "__type": "Pointer",
		    "className":"categories",
		    "objectId": $scope.newExpense.categoryID.objectId
		};
		$scope.newExpense.owner = {
			"__type": "Pointer",
			"className":"_User",
			"objectId": $localstorage.get('objectId')
		};
		//devo anche andare alla slide giusta!!!!!!!!!!

		$scope.show = "calc";
		
		Categories.getAll().success(function(data){
			var tmpArray = data.results;
			var elementXpage = 2;
			$scope.allCategories = data.results;
			$scope.newExpense.categoryID.objectId = tmpArray[0].objectId?tmpArray[0].objectId:0;
			var outputArray = Array();
			for (var idx = 0; idx < tmpArray.length; idx+=elementXpage){
				outputArray.push(tmpArray.slice(idx, idx+elementXpage));
			}
			$scope.categories = outputArray;
			$ionicSlideBoxDelegate.update();
		});
		
		$scope.editExpenseModalPage.show()
  }


  $scope.closeExpenseModalPage = function() {
    $scope.editExpenseModalPage.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.editExpenseModalPage.remove();
  });	
	

  

	$scope.checkSelected = function(categoryToCheck){
        if($scope.newExpense.categoryID.objectId == categoryToCheck){
			return "redCat";
		}
    }

	$scope.navSlide = function(index) {
        $ionicSlideBoxDelegate.slide(index, 500);
    }
	
	$scope.showTab = function(tabToShow) {
        $scope.show = tabToShow;
    }
	
	$scope.setCategory = function(categorySelected) {
        $scope.newExpense.categoryID.objectId = categorySelected;
    }
	
	$scope.createExpense = function(){
		$scope.newExpense.value = $scope.strDotted;
		selectedCat = $scope.allCategories.filter(function(item){if (item.objectId == $scope.newExpense.categoryID.objectId) return item;});
		selectedCat = selectedCat[0];
		$scope.newExpense.ACL = {};
		$scope.newExpense.ACL[$localstorage.get('objectId')] = { "read": true, "write": true};
		if (selectedCat.shared == true){
			$scope.newExpense.ACL["role:friendsOf_" + $localstorage.get('objectId')] = { "read": true};
		}
		//{ $localstorage.get('objectId'): { "read": true, "write": true}};		
		if(!!$scope.newExpense.objectId){
			Expenses.edit($scope.newExpense.objectId, $scope.newExpense).success(function(data){
			   $scope.closeExpenseModalPage();
			   Expenses.getAll().success(function(data){
				 $scope.expenses=data.results;
			   });
			});
		}else{
			Expenses.create($scope.newExpense).success(function(data){
			   $scope.closeExpenseModalPage();
			   Expenses.getAll().success(function(data){
				 $scope.expenses=data.results;
			   });
			});
		}
	}
	
	$scope.addNumber=function(buttonPressed){
        str = $scope.fullString;
		if (buttonPressed == "D"){
			str = str.substr(0,str.length-1);
			if (str.length < 3){
				str = "0"+str;
			}
		}else{
			str += buttonPressed;
		}
		leftString = parseInt(str.substr(0,str.length-2)).toString();
		rightString = str.substr(str.length-2,2);
		$scope.strDotted = leftString + "," + rightString;
		$scope.fullString = leftString + rightString;
	}
//////////////////////////////////////////////////////
/////////      end expense handling functions
///////////////////////////////////////////////////////   
	
})


.controller('ExpenseDetailCtrl', function($scope, $stateParams, Expenses, Categories) {
	$scope.dateFormat = 'dd/MM/yyyy';
	  Expenses.get($stateParams.expenseId).success(function(data){
				$scope.expense=data;
				Categories.get(data.categoryID).success(function(data){
					$scope.category = data;
				}); 
	  }); 
})

.controller('ExpensesCtrl', function($scope, $stateParams, Expenses, Categories, $state, $ionicSlideBoxDelegate) {

	Expenses.getMine().success(function(data){
        $scope.expenses=data.results;
    });
	
	  $scope.removeExpense=function(item){
        Expenses.delete(item.objectId);
        $scope.expenses.splice($scope.expenses.indexOf(item),1);
    }
	
})

.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})
.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('CategoriesCtrl', function($scope, Categories) {
	Categories.getFull().success(function(data){
      $scope.categories=data.result;
  });
})

.controller('CategoryDetailCtrl', function($scope, $stateParams, Expenses, Categories) {
	
	$scope.used = '0,00';	
	
	Categories.get($stateParams.categoryId).success(function(data){
		$scope.category = data;
		$scope.category.budget = $scope.category.budget.toFixed(2);
	  });
	  Expenses.getAllByCatId($stateParams.categoryId).success(function(data){
	  	$scope.expenses = data.results;
		var sum = 0;
		for (var idx = 0;idx < data.results.length; idx++){
			sum += parseFloat(data.results[idx].value);
		}
		$scope.used = 	sum.toFixed(2);
	  });
	  
	 $scope.removeExpense=function(item){
        Expenses.delete(item.objectId);
        $scope.expenses.splice($scope.expenses.indexOf(item),1);
    }
})


.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
