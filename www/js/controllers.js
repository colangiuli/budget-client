angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

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
  $scope.expense = Expenses.get($stateParams.expenseId);
})

.controller('ExpenseAddCtrl', function($scope, $stateParams, Expenses, Categories) {
  $scope.category = Categories.get($stateParams.categoryId?$stateParams.categoryId:0);
  $scope.categories = Categories.all();
  $scope.create = function(expense) {
    //Expenses.remove(expense);
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
