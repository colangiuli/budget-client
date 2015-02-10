angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ExpensesCtrl', function($scope, Expenses) {
  $scope.expenses = Expenses.all();
  $scope.remove = function(expense) {
    Expenses.remove(expense);
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
