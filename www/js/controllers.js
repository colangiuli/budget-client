angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ExpensesCtrl', function($scope, $ionicModal, Expenses, Categories) {
  $scope.expenses = Expenses.all();
  $scope.categories = Categories.all();
  $scope.remove = function(expense) {
    Expenses.remove(expense);
  }
  $scope.edit = function(expense) {
    //Expenses.remove(expense);
  }

  $ionicModal.fromTemplateUrl('contact-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  })

  $scope.openModal = function() {
    $scope.modal.show();
  }

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

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
