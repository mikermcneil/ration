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
      friends: [
        {
          fullName: '',
          emailAddress: ''
        },
        {
          fullName: '',
          emailAddress: ''
        },
        {
          fullName: '',
          emailAddress: ''
        }
      ]
    },

    // For tracking client-side validation errors in our form.
    // > Has property set to `true` for each invalid property in `addFriendsFormData`.
    formErrors: { /* … */ },

    // Syncing / loading state
    syncing: false,

    // Server error state
    cloudError: '',

    // Success state when form has been submitted
    cloudSuccess: false,

    selectedFriend: undefined,
    confirmRemoveFriendModalOpen: false,
  },

  virtualPages: true,
  html5HistoryMode: 'history',
  virtualPagesRegExp: new RegExp(/^\/friends\/?([^\/]+)?/),

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    // Attach any initial data from the server.
    _.extend(this, SAILS_LOCALS);
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    clickInviteButton: function() {
      // Open the modal.
      this.goto('/friends/new');
    },

    _clearAddFriendsModal: function() {
      this.goto('/friends');
      // Reset form data.
      this.addFriendsFormData = {
        friends: [
          {
            fullName: '',
            emailAddress: ''
          },
          {
            fullName: '',
            emailAddress: ''
          },
          {
            fullName: '',
            emailAddress: ''
          }
        ]
      };
      this.formErrors = {};
      this.cloudError = '';
    },

    closeAddFriendsModal: function() {
      this._clearAddFriendsModal();
    },

    clickAddMoreButton: function() {
      this.addFriendsFormData.friends.push({
        fullName: '',
        emailAddress: ''
      });
    },

    handleParsingAddFriendsForm: function() {
      console.log('can you handle this?');
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      var argins = _.cloneDeep(this.addFriendsFormData);

      // Check whether there are any rows with a name but not an email.
      var isValidEmailAddress = parasails.require('isValidEmailAddress');
      var hasAtLeastOneInvalidFriend = !_.isUndefined(_.find(argins.friends, (friend)=> {
        if((friend.fullName !== '' || friend.emailAddress !== '') && !isValidEmailAddress(friend.emailAddress)) {
          return true;
        }
        return false;
      }));

      if(hasAtLeastOneInvalidFriend) {
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
      _.remove(argins.friends, {fullName: '', emailAddress: ''});

      return argins;
    },

    submittedAddFriendsForm: function() {
      var invitedFriends = _.filter(this.addFriendsFormData.friends, (friend)=>{
        return friend.fullName !== '' && friend.emailAddress !== '';
      });
      console.log('invited friends:',invitedFriends);
      // Add the new friends to the requests list
      this.me.outboundFriendRequests = this.me.outboundFriendRequests.concat(invitedFriends);
      this.$forceUpdate();
      this._clearAddFriendsModal();
    },

    clickRemoveFriend: function(friendId) {
      this.selectedFriend = _.find(this.me.friends, {id: friendId});
      console.log('selectedFriend',this.selectedFriend);

      // Open the modal.
      this.confirmRemoveFriendModalOpen = true;
    },

    closeRemoveFriendModal: function() {
      this.selectedFriend = undefined;
      this.confirmRemoveFriendModalOpen = false;
      this.cloudError = '';
    },

    handleParsingRemoveFriendForm: function() {
      return {
        id: this.selectedFriend.id
      };
    },

    submittedRemoveFriendForm: function() {

      // Remove this user from our friends list.
      _.remove(this.me.friends, {id: this.selectedFriend.id});

      // Close the modal.
      this.selectedFriend = undefined;
      this.confirmRemoveFriendModalOpen = false;
      this.cloudError = '';
    },

    clickApproveFriend: async function(userId) {
      // Prevent double-posting
      if(this.syncing) {
        return;
      }
      this.syncing = true;
      await Cloud.approveFriend({ id: userId });
      // Add this user to our approved friends list.
      var approvedFriend =_.find(this.me.inboundFriendRequests, {id: userId});
      this.me.friends.unshift({
        id: approvedFriend.id,
        fullName: approvedFriend.fullName,
        emailAddress: approvedFriend.emailAddress
      });
      // Remove this user from our friends list.
      _.remove(this.me.inboundFriendRequests, {id: userId});
      // Clear loading state
      this.syncing = false;
    },
  },
});
