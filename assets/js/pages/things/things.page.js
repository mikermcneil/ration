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
      returnDate: undefined,
      pickupInfo: undefined
    },

    // For tracking client-side validation errors in our form.
    // > Has property set to `true` for each invalid property in `formData`.
    formErrors: { /* … */ },

    // Syncing / loading state
    syncing: false,

    // Server error state
    cloudError: '',

    selectedThing: undefined,

    borrowFormSuccess: false
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
    this.things = this._marshalEntries(this.things);
  },

  mounted: function() {
    this.$find('[data-toggle="tooltip"]').tooltip();
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    _marshalEntries: function(entries) {
      // Marshal provided array of data and return the modified version.
      return _.map(entries, (entry)=>{

        var isBorrowed = !_.isNull(entry.borrowedBy);
        // if(isBorrowed) {
        //   console.log('borrowed by',entry.borrowedBy.id);
        //   console.log('is me?',entry.borrowedBy.id === this.me.id);
        // }
        if(entry.owner.id === this.me.id) {
          entry.unavailable = false;
        }
        else if(!isBorrowed) {
          entry.unavailable = false;
        }
        else if(entry.borrowedBy.id === this.me.id) {
          entry.unavailable = false;
        }
        else {
          entry.unavailable = true;
        }
        return entry;
      });
    },

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
        returnDate: undefined,
        pickupInfo: undefined
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

      var argins = _.extend({ id: this.selectedThing.id }, this.borrowFormData);

      if(!argins.returnDate) {
        this.formErrors.returnDate = true;
      }

      if(!argins.pickupInfo) {
        this.formErrors.pickupInfo = true;
      }

      // Convert the return time into a real date.
      argins.returnDate = new Date(this.$refs.datepickerref.doParseDate()).getTime();
      // console.log('returnDate', argins.returnDate);

      // If there were any issues, they've already now been communicated to the user,
      // so simply return undefined.  (This signifies that the submission should be
      // cancelled.)
      if (Object.keys(this.formErrors).length > 0) {
        return;
      }

      return argins;
    },

    submittedBorrowThingForm: function() {

      // Show success message.
      this.borrowFormSuccess = true;

      // Update the borrowed item in the UI.
      var borrowedItem = _.find(this.things, {id: this.selectedThing.id});
      borrowedItem.borrowedBy = this.me;
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
