parasails.registerPage('friends', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {

    friends: [],

    // The "virtual" portion of the URL which is managed by this page script.
    virtualPageSlug: '',

    // Form data
    formData: {
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
    // > Has property set to `true` for each invalid property in `formData`.
    formErrors: { /* … */ },

    // Syncing / loading state
    syncing: false,

    // Server error state
    cloudError: '',

    // Success state when form has been submitted
    cloudSuccess: false,

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
      this.goto('/friends/invite');
    },

    openedInviteFriendsModal: function() {
      // TODO: focus first field
    },

    closeInviteFriendsModal: function() {
      this.goto('/friends');
    },

    handleParsingInviteFriendsForm: function() {
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      var argins = this.formData;

      // Check whether there are any rows with a name but not an email.
      var isValidEmailAddress = parasails.require('isValidEmailAddress');
      var hasAtLeastOneInvalidFriend = !_.isUndefined(_.find(this.argins.friends, (friend)=> {
        if(friend.fullName === '' && (friend.emailAddress !== '' || !isValidEmailAddress(friend.emailAddress))) {
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
      _.remove(argins.friends, {fullName: '', email: ''});

      return argins;
    },

    submittedInviteFriendsForm: function() {
      // Add the new friends to the list
      // TODO
    },


  },
});
