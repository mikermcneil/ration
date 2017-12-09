parasails.registerPage('things', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {

    things: [],

    // The "virtual" portion of the URL which is managed by this page script.
    virtualPageSlug: '',

    // Form data
    uploadFormData: {
      photo: undefined,
      label: '',
      previewImageSrc: ''
    },
    borrowFormData: {
      returnTime: undefined,
      pickupTime: undefined
    },

    // For tracking client-side validation errors in our form.
    // > Has property set to `true` for each invalid property in `formData`.
    formErrors: { /* … */ },

    // Syncing / loading state
    syncing: false,

    // Server error state
    cloudError: '',

    selectedThing: undefined
  },

  virtualPages: true,
  html5HistoryMode: 'history',
  virtualPagesRegExp: new RegExp(/^\/things\/?([^\/]+)?/),

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    // Attach any initial data from the server.
    _.extend(this, SAILS_LOCALS);
  },

  mounted: function() {
    this.$find('[data-toggle="tooltip"]').tooltip();
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    _clearUploadThingModal: function() {
      // Close modal
      this.goto('/things');
      // Reset form data
      this.uploadFormData = {
        photo: undefined,
        label: '',
        previewImageSrc: ''
      };
      // Clear error states
      this.formErrors = {};
      this.cloudError = '';
    },

    _clearBorrowThingModal: function() {
      // Close modal
      this.goto('/things');
      // Reset form data
      this.borrowFormData = {
        returnTime: undefined,
        pickupTime: undefined
      };
      this.selectedThing = undefined;
      // Clear error states
      this.formErrors = {};
      this.cloudError = '';
    },

    clickAddButton: function() {
      // Open the modal.
      this.goto('/things/new');
    },

    closeUploadThingModal: function() {
      this._clearUploadThingModal();
    },

    handleParsingUploadThingForm: function() {
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      var argins = this.uploadFormData;

      if(!argins.photo) {
        this.formErrors.photo = true;
      }

      // If there were any issues, they've already now been communicated to the user,
      // so simply return undefined.  (This signifies that the submission should be
      // cancelled.)
      if (Object.keys(this.formErrors).length > 0) {
        return;
      }

      return _.omit(argins, ['previewImageSrc']);
    },

    submittedUploadThingForm: function(result) {
      var newItem = _.extend(result, {
        owner: {
          id: this.me.id,
          fullName: this.me.fullName
        }
      });

      // Add the new thing to the list
      this.things.unshift(newItem);

      // Close the modal.
      this._clearUploadThingModal();
    },

    changeFileInput: function(files) {
      if (files.length !== 1) {
        throw new Error('Consistency violation: `changeFileInput` was somehow called with an empty array of files, or with more than one file in the array!');
      }
      var selectedFile = files[0];
      this.uploadFormData.photo = selectedFile;

      // Set up the file preview for the UI:
      var reader = new FileReader();
      reader.onload = (event)=>{
        this.uploadFormData.previewImageSrc = event.target.result;

        // Unbind this "onload" event.
        delete reader.onload;
      };
      // Clear out any error messages about not providing an image.
      this.formErrors.photo = false;
      reader.readAsDataURL(selectedFile);

    },

    clickBorrow: function(thingId) {
      this.selectedThing = _.find(this.things, {id: thingId});

      // Open the modal.
      this.goto('/things/borrow');
    },

    closeBorrowThingModal: function() {
      this._clearBorrowThingModal();
    },

    handleParsingBorrowThingForm: function() {
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      var argins = this.borrowFormData;

      // If there were any issues, they've already now been communicated to the user,
      // so simply return undefined.  (This signifies that the submission should be
      // cancelled.)
      if (Object.keys(this.formErrors).length > 0) {
        return;
      }

      return argins;
    },

    submittedBorrowThingForm: function() {

      // Close the modal.
      this._clearBorrowThingModal();
    },

    clickDeleteThing: function(thingId) {
      // ...
    },

    clickMarkReturned: function(thingId) {
      // ...
    },

    clickContactBorrower: function(thingId) {
      // ...
    },

    clickReturn: function(thingId) {
      // ...
    },

    clickContactOwner: function(thingId) {
      // ...
    },
  }
});
