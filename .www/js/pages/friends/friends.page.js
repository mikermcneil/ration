'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

parasails.registerPage('friends', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {

    friends: [],

    // The "virtual" portion of the URL which is managed by this page script.
    virtualPageSlug: '',

    // Form data
    addFriendsFormData: {
      friends: [{
        fullName: '',
        emailAddress: ''
      }, {
        fullName: '',
        emailAddress: ''
      }, {
        fullName: '',
        emailAddress: ''
      }]
    },

    // For tracking client-side validation errors in our form.
    // > Has property set to `true` for each invalid property in `addFriendsFormData`.
    formErrors: {/* … */},

    // Syncing / loading state
    syncing: false,

    // Server error state
    cloudError: '',

    // Success state when form has been submitted
    cloudSuccess: false,

    selectedFriend: undefined,
    confirmRemoveFriendModalOpen: false
  },

  virtualPages: true,
  html5HistoryMode: 'history',
  virtualPagesRegExp: new RegExp(/^\/friends\/?([^\/]+)?/),

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function beforeMount() {
    // Attach any initial data from the server.
    _.extend(this, SAILS_LOCALS);
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    clickInviteButton: function clickInviteButton() {
      // Open the modal.
      this.goto('/friends/new');
    },

    _clearAddFriendsModal: function _clearAddFriendsModal() {
      this.goto('/friends');
      // Reset form data.
      this.addFriendsFormData = {
        friends: [{
          fullName: '',
          emailAddress: ''
        }, {
          fullName: '',
          emailAddress: ''
        }, {
          fullName: '',
          emailAddress: ''
        }]
      };
      this.formErrors = {};
      this.cloudError = '';
    },

    closeAddFriendsModal: function closeAddFriendsModal() {
      this._clearAddFriendsModal();
    },

    clickAddMoreButton: function clickAddMoreButton() {
      this.addFriendsFormData.friends.push({
        fullName: '',
        emailAddress: ''
      });
    },

    handleParsingAddFriendsForm: function handleParsingAddFriendsForm() {
      console.log('can you handle this?');
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      var argins = _.cloneDeep(this.addFriendsFormData);

      // Check whether there are any rows with a name but not an email.
      var isValidEmailAddress = parasails.require('isValidEmailAddress');
      var hasAtLeastOneInvalidFriend = !_.isUndefined(_.find(argins.friends, function (friend) {
        if ((friend.fullName !== '' || friend.emailAddress !== '') && !isValidEmailAddress(friend.emailAddress)) {
          return true;
        }
        return false;
      }));

      if (hasAtLeastOneInvalidFriend) {
        this.formErrors.friends = true;
        return;
      }

      // If there were any issues, they've already now been communicated to the user,
      // so simply return undefined.  (This signifies that the submission should be
      // cancelled.)
      if (Object.keys(this.formErrors).length > 0) {
        return;
      }

      // Otherwise, trim out any empty rows before submitting.
      _.remove(argins.friends, { fullName: '', emailAddress: '' });

      return argins;
    },

    submittedAddFriendsForm: function submittedAddFriendsForm() {
      var invitedFriends = _.filter(this.addFriendsFormData.friends, function (friend) {
        return friend.fullName !== '' && friend.emailAddress !== '';
      });
      console.log('invited friends:', invitedFriends);
      // Add the new friends to the requests list
      this.me.outboundFriendRequests = this.me.outboundFriendRequests.concat(invitedFriends);
      this.$forceUpdate();
      this._clearAddFriendsModal();
    },

    clickRemoveFriend: function clickRemoveFriend(friendId) {
      this.selectedFriend = _.find(this.me.friends, { id: friendId });
      console.log('selectedFriend', this.selectedFriend);

      // Open the modal.
      this.confirmRemoveFriendModalOpen = true;
    },

    closeRemoveFriendModal: function closeRemoveFriendModal() {
      this.selectedFriend = undefined;
      this.confirmRemoveFriendModalOpen = false;
      this.cloudError = '';
    },

    handleParsingRemoveFriendForm: function handleParsingRemoveFriendForm() {
      return {
        id: this.selectedFriend.id
      };
    },

    submittedRemoveFriendForm: function submittedRemoveFriendForm() {

      // Remove this user from our friends list.
      _.remove(this.me.friends, { id: this.selectedFriend.id });

      // Close the modal.
      this.selectedFriend = undefined;
      this.confirmRemoveFriendModalOpen = false;
      this.cloudError = '';
    },

    clickApproveFriend: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(userId) {
        var approvedFriend;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.syncing) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt('return');

              case 2:
                this.syncing = true;
                _context.next = 5;
                return Cloud.approveFriend.with({ id: userId });

              case 5:
                // Add this user to our approved friends list.
                approvedFriend = _.find(this.me.inboundFriendRequests, { id: userId });

                this.me.friends.unshift({
                  id: approvedFriend.id,
                  fullName: approvedFriend.fullName,
                  emailAddress: approvedFriend.emailAddress
                });
                // Remove this user from our friends list.
                _.remove(this.me.inboundFriendRequests, { id: userId });
                // Clear loading state
                this.syncing = false;

              case 9:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function clickApproveFriend(_x) {
        return _ref.apply(this, arguments);
      }

      return clickApproveFriend;
    }()
  }
});
