(function (ng) {
  "use strict";

  ng.module('notifications', []).
    service('notifications',function ($rootScope) {

      if (!$rootScope.notifications) {
        $rootScope.notifications = [];
      }

      $rootScope.$on('$routeChangeStart', function () {
        service.reset();
      });

      /**
       * Private factory function to create shortcut methods
       * @param method
       * @returns {Function}
       */
      function initShortcut (method) {
        return function (message) {
          return service.add({
            message: message,
            severity: method
          });
        }
      }

      var service = {
        /**
         * Shortcut methods are able only to display simple text messages
         */
        success: initShortcut('success'),
        alert: initShortcut('alert'),
        error: initShortcut('error'),

        /**
         * general low-level method to create notifications
         * @param {object} settings
         *    - severity {enum} success, alert, error
         *    - showClose {bool} show close button or not
         *    - templateUrl {string} path to notification template
         * @returns {Number} index of added notification
         */
        add: function (settings) {
          var index = $rootScope.notifications.length;

          var baseNotification = {
            index: index,
            severity: 'alert',
            showClose: settings.showClose !== false,
            isTemplateUrl: !!settings.templateUrl,
            display: true
          };

          $rootScope.notifications[index] = angular.extend(baseNotification, settings);

          return index;
        },

        /**
         * hides notification with given index
         * @param index
         */
        hide: function (index) {
          if (typeof index === 'undefined') {
            return;
          }

          $rootScope.notifications[index].display = false;
        },

        /**
         * clears notifications stack
         */
        reset: function () {
          $rootScope.notifications = [];
        }
      };

      return service;
    }).
    directive('notification',function (notifications) {
      return {
        restrict: 'E',
        compile: function (element, attrs, transclude) {
          var el = element[0];
          el.style.display = 'none';
          var watchExpr = attrs.on;
          var notificationType = attrs.type;
          var notificationText = el.innerHTML;
          var notificationIndex = -1;

          function watchFunc (newValue) {
            if (newValue) {
              notificationIndex = notifications[notificationType](notificationText);
            } else {
              if (notificationIndex > -1) {
                notifications.hide(notificationIndex);
              }
            }
          }

          return function (scope, element, attrs) {
            // execute
            scope.$watch(watchExpr, watchFunc);
          }
        }
      };
    }).
    controller('notificationController', function ($scope, $rootScope, notifications) {
      $scope.notifications = $rootScope.notifications;
      $scope.hide = notifications.hide;
    });
})(angular);
