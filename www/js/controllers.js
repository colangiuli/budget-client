angular.module('starter.controllers', [])


.controller('ExpensesCtrl', function($scope, Expenses) {
	
	Expenses.getAll().success(function(data){
        $scope.expenses=data.results;
    });

  $scope.remove=function(item){
        Expenses.delete(item.objectId);
        $scope.expenses.splice($scope.expenses.indexOf(item),1);
    }
  
  $scope.edit = function(expense) {
    //Expenses.remove(expense);
  }
})

.controller('ExpenseDetailCtrl', function($scope, $stateParams, Expenses) {
	  //$scope.expense = Expenses.get($stateParams.expenseId);
	  Expenses.get($stateParams.expenseId).success(function(data){
				$scope.expense=data;
	  }); 
})

.controller('ExpenseAddCtrl', function($scope, $stateParams, Expenses, Categories, $state, $ionicSlideBoxDelegate) {
///////////////////////////////////////////////////////
/////////      INIT
///////////////////////////////////////////////////////
	$scope.newExpense={};
	$scope.newExpense.date = new Date();
	$scope.newExpense.note = "--";
	$scope.newExpense.value = 0;
	$scope.fullString="000";
	$scope.strDotted = "0,00";
	$scope.show = "calc";
	
	Categories.getAll().success(function(data){
		var tmpArray = data.results;
		var elementXpage = 2;
		$scope.newExpense.categoryID = tmpArray[0].objectId | 0;
		var outputArray = Array();
		for (var idx = 0; tmpArray.length > 0; idx++){
			outputArray[idx] = tmpArray.splice(0, elementXpage);
		}
		$scope.categories = outputArray;
		$ionicSlideBoxDelegate.update();
	});
	

///////////////////////////////////////////////////////
/////////      FUNCTIONS
///////////////////////////////////////////////////////   
	$scope.navSlide = function(index) {
        $ionicSlideBoxDelegate.slide(index, 500);
    }
	
	$scope.showTab = function(tabToShow) {
        $scope.show = tabToShow;
    }
	
	$scope.setCategory = function(categorySelected) {
        $scope.newExpense.categoryID = categorySelected;
    }
	
	$scope.create = function(){
		$scope.newExpense.value = parseInt($scope.strDotted);
        Expenses.create($scope.newExpense).success(function(data){
           $state.go('tab.expenses');
		});
	}
	
	$scope.cancel=function(){
        $state.go('tab.expenses');
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
  $scope.categories = Categories.all();
})

.controller('CategoryDetailCtrl', function($scope, $stateParams, Categories) {
  $scope.category = Categories.get($stateParams.categoryId);
})


.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
