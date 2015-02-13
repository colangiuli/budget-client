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
	//$scope.category = Categories.get($stateParams.categoryId?$stateParams.categoryId:0);
	//$scope.categories = Categories.all();
	Categories.getAll().success(function(data){
		var tmpArray = data.results;
		var elementXpage = 2;
		var outputArray = Array();
		for (var idx = 0; tmpArray.length > 0; idx++){
			outputArray[idx] = tmpArray.splice(0, elementXpage);
		}
		$scope.categories = outputArray;
		$ionicSlideBoxDelegate.update();

	});
	$scope.newExpense={};
	$scope.fullString="000";
	$scope.strDotted = "0,00";
    
	 $scope.navSlide = function(index) {
        $ionicSlideBoxDelegate.slide(index, 500);
    }
	
	$scope.create=function(expense){
        Expenses.create(expense).success(function(data){
            $state.go('tab.expenses');
		});
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
