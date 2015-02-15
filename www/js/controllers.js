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
	$scope.dateFormat = 'dd-MM-yyyy HH:mm';



	
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
		$scope.newExpense.categoryID = {
		    "__type": "Pointer",
		    "className":"categories",
		    "objectId": ""
		}
	$scope.newExpense.value = 0;
	$scope.fullString="000";
	$scope.strDotted = "0,00";
	$scope.show = "calc";
	
	Categories.getAll().success(function(data){
		var tmpArray = data.results;
		var elementXpage = 2;
		$scope.newExpense.categoryID.objectId = tmpArray[0].objectId?tmpArray[0].objectId:0;
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
		$scope.strDotted = expense.value;
	
		leftString = parseInt(expense.value.substr(0,expense.value.length-3)).toString();
		rightString = expense.value.substr(expense.value.length-2,2);
		$scope.fullString = leftString + rightString;
		$scope.newExpense.categoryID = {
		    "__type": "Pointer",
		    "className":"categories",
		    "objectId": $scope.newExpense.categoryID.objectId
		}
		//devo anche andare alla slide giusta!!!!!!!!!!

		$scope.show = "calc";
		
		Categories.getAll().success(function(data){
			var tmpArray = data.results;
			var elementXpage = 2;
		//	$scope.newExpense.categoryID.objectId = tmpArray[0].objectId?tmpArray[0].objectId:0;
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
	
	$scope.create = function(){
		$scope.newExpense.value = $scope.strDotted;		
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
	Categories.getFull().success(function(data){
      $scope.categories=data.result;
  });
})

.controller('CategoryDetailCtrl', function($scope, $stateParams, Expenses, Categories) {
	  Categories.get($stateParams.categoryId).success(function(data){
		$scope.category = data;
		$scope.used = '0,00';
	  });
	  Expenses.getAllByCatId($stateParams.categoryId).success(function(data){
	  	$scope.expenses = data.results;
		var sum = 0;
		for (var idx = 0;idx < data.results.length; idx++){
			sum += parseFloat(data.results[idx].value);
		}
		$scope.used = 	sum.toFixed(2);
	  });
})


.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
