angular.module('starter.controllers', [])

.controller('ExpenseDetailCtrl', function($scope, $stateParams, Expenses, Categories) {
	  Expenses.get($stateParams.expenseId).success(function(data){
				$scope.expense=data;
				Categories.get(data.categoryID).success(function(data){
					$scope.category = data;
				}); 
	  }); 
})

.controller('ExpensesCtrl', function($scope, $stateParams, Expenses, Categories, $state, $ionicSlideBoxDelegate, $ionicModal) {

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
	
	Expenses.getAll().success(function(data){
        $scope.expenses=data.results;
    });
	
	Categories.getAll().success(function(data){
		var tmpArray = data.results;
		var elementXpage = 2;
		$scope.newExpense.categoryID = tmpArray[0].objectId | 0;
		var outputArray = Array();
		for (var idx = 0; tmpArray.length > 0; idx++){
			outputArray[idx] = tmpArray.splice(0, elementXpage);
		}
		$scope.categories = outputArray;
		$scope.allCategories = tmpArray;
		$ionicSlideBoxDelegate.update();
	});
	
	$ionicModal.fromTemplateUrl('templates/expense-add-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal
	})  

///////////////////////////////////////////////////////
/////////      FUNCTIONS
///////////////////////////////////////////////////////   
  $scope.openModal = function() {
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
		$scope.allCategories = tmpArray;
		$ionicSlideBoxDelegate.update();
	});
	
    $scope.modal.show()
  }
  
    $scope.edit = function(expense) {
		$scope.newExpense = expense;
		$scope.strDotted = expense.value + "," + "00";
		$scope.fullString = expense.value + "00";

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
			$scope.allCategories = tmpArray;
			$ionicSlideBoxDelegate.update();
		});
		
		$scope.modal.show()
  }


  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });	
	
  $scope.remove=function(item){
        Expenses.delete(item.objectId);
        $scope.expenses.splice($scope.expenses.indexOf(item),1);
    }
  

	$scope.checkSelected = function(categoryToCheck){
        if($scope.newExpense.categoryID == categoryToCheck){
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
        $scope.newExpense.categoryID = categorySelected;
    }
	
	$scope.create = function(){
		$scope.newExpense.value = parseInt($scope.strDotted);
		if(!!$scope.newExpense.objectId){
			Expenses.edit($scope.newExpense.objectId, $scope.newExpense).success(function(data){
			   $scope.closeModal();
			   Expenses.getAll().success(function(data){
				 $scope.expenses=data.results;
			   });
			});
		}else{
			Expenses.create($scope.newExpense).success(function(data){
			   $scope.closeModal();
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
