'use strict';

parasails.registerPage('available-things', {
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
      expectedReturnAt: undefined,
      pickupInfo: undefined
    },
    scheduleReturnFormData: {
      dropoffInfo: undefined
    },

    // Modals which aren't linkable:
    borrowThingModalOpen: false,
    confirmDeleteThingModalOpen: false,
    scheduleReturnModalOpen: false,
    confirmReturnModalOpen: false,

    // For tracking client-side validation errors in our form.
    // > Has property set to `true` for each invalid property in `formData`.
    formErrors: {/* … */},

    // Syncing / loading state
    syncing: false,

    // Server error state
    cloudError: '',

    selectedThing: undefined,

    borrowFormSuccess: false,
    scheduleReturnFormSuccess: false
  },

  virtualPages: true,
  html5HistoryMode: 'history',
  virtualPagesRegExp: /^\/things\/?([^\/]+)?/,

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function beforeMount() {
    // Attach any initial data from the server.
    _.extend(this, SAILS_LOCALS);
    this.things = this._marshalEntries(this.things);
  },

  mounted: function mounted() {
    this.$find('[data-toggle="tooltip"]').tooltip();
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    _marshalEntries: function _marshalEntries(entries) {
      var _this = this;

      // Marshal provided array of data and return the modified version.
      return _.map(entries, function (entry) {

        var isBorrowed = !_.isNull(entry.borrowedBy);

        if (entry.owner.id === _this.me.id) {
          entry.unavailable = false;
        } else if (!isBorrowed) {
          entry.unavailable = false;
        } else if (entry.borrowedBy.id === _this.me.id) {
          entry.unavailable = false;
        } else {
          entry.unavailable = true;
        }
        return entry;
      });
    },

    _clearUploadThingModal: function _clearUploadThingModal() {
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

    _clearBorrowThingModal: function _clearBorrowThingModal() {
      // Close modal
      this.borrowThingModalOpen = false;
      // Reset form data
      this.borrowFormData = {
        expectedReturnAt: undefined,
        pickupInfo: undefined
      };
      this.selectedThing = undefined;
      // Clear error states
      this.formErrors = {};
      this.cloudError = '';
    },

    _clearScheduleReturnModal: function _clearScheduleReturnModal() {
      // Close modal
      this.scheduleReturnModalOpen = false;
      // Reset form data
      this.scheduleReturnFormData = {
        dropoffInfo: undefined
      };
      this.selectedThing = undefined;
      // Clear error states
      this.formErrors = {};
      this.cloudError = '';
    },

    clickAddButton: function clickAddButton() {
      // Open the modal.
      this.goto('/things/new');
    },

    closeUploadThingModal: function closeUploadThingModal() {
      this._clearUploadThingModal();
    },

    handleParsingUploadThingForm: function handleParsingUploadThingForm() {
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      var argins = this.uploadFormData;

      if (!argins.photo) {
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

    submittedUploadThingForm: function submittedUploadThingForm(result) {
      var newItem = _.extend(result, {
        label: this.uploadFormData.label,
        isBorrowed: false,
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

    changeFileInput: function changeFileInput(files) {
      var _this2 = this;

      if (files.length !== 1 && !this.uploadFormData.photo) {
        throw new Error('Consistency violation: `changeFileInput` was somehow called with an empty array of files, or with more than one file in the array!  This should never happen unless there is already an uploaded file tracked.');
      }
      var selectedFile = files[0];

      // If you cancel from the native upload window when you already
      // have a photo tracked, then we just avast (return early).
      // In this case, we just leave whatever you had there before.
      if (!selectedFile && this.uploadFormData.photo) {
        return;
      }

      this.uploadFormData.photo = selectedFile;

      // Set up the file preview for the UI:
      var reader = new FileReader();
      reader.onload = function (event) {
        _this2.uploadFormData.previewImageSrc = event.target.result;

        // Unbind this "onload" event.
        delete reader.onload;
      };
      // Clear out any error messages about not providing an image.
      this.formErrors.photo = false;
      reader.readAsDataURL(selectedFile);
    },

    clickBorrow: function clickBorrow(thingId) {
      this.selectedThing = _.find(this.things, { id: thingId });

      // Open the modal.
      this.borrowThingModalOpen = true;
    },

    closeBorrowThingModal: function closeBorrowThingModal() {
      this._clearBorrowThingModal();
    },

    handleParsingBorrowThingForm: function handleParsingBorrowThingForm() {
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      var argins = _.extend({ id: this.selectedThing.id }, this.borrowFormData);

      if (!argins.expectedReturnAt) {
        this.formErrors.expectedReturnAt = true;
      }

      if (!argins.pickupInfo) {
        this.formErrors.pickupInfo = true;
      }

      // Convert the return time into a real date.
      argins.expectedReturnAt = this.$refs.datepickerref.doParseDate().getTime();
      // console.log('expectedReturnAt', argins.expectedReturnAt);

      // If there were any issues, they've already now been communicated to the user,
      // so simply return undefined.  (This signifies that the submission should be
      // cancelled.)
      if (Object.keys(this.formErrors).length > 0) {
        return;
      }

      return argins;
    },

    submittedBorrowThingForm: function submittedBorrowThingForm() {

      // Show success message.
      this.borrowFormSuccess = true;

      // Update the borrowed item in the UI.
      var borrowedItem = _.find(this.things, { id: this.selectedThing.id });
      borrowedItem.borrowedBy = this.me;
    },

    clickDeleteThing: function clickDeleteThing(thingId) {
      this.selectedThing = _.find(this.things, { id: thingId });

      // Open the modal.
      this.confirmDeleteThingModalOpen = true;
    },

    closeDeleteThingModal: function closeDeleteThingModal() {
      this.selectedThing = undefined;
      this.confirmDeleteThingModalOpen = false;
      this.cloudError = '';
    },

    handleParsingDeleteThingForm: function handleParsingDeleteThingForm() {
      return {
        id: this.selectedThing.id
      };
    },

    submittedDeleteThingForm: function submittedDeleteThingForm() {

      // Remove the thing from the list
      _.remove(this.things, { id: this.selectedThing.id });

      // Close the modal.
      this.selectedThing = undefined;
      this.confirmDeleteThingModalOpen = false;
    },

    clickReturn: function clickReturn(thingId) {
      this.selectedThing = _.find(this.things, { id: thingId });

      // Open the modal
      this.scheduleReturnModalOpen = true;
    },

    closeScheduleReturnModal: function closeScheduleReturnModal() {
      this._clearBorrowThingModal();
    },

    handleParsingScheduleReturnForm: function handleParsingScheduleReturnForm() {
      // Clear out any pre-existing error messages.
      this.formErrors = {};

      var argins = _.extend({ id: this.selectedThing.id }, this.scheduleReturnFormData);

      if (!argins.dropoffInfo) {
        this.formErrors.dropoffInfo = true;
      }

      // If there were any issues, they've already now been communicated to the user,
      // so simply return undefined.  (This signifies that the submission should be
      // cancelled.)
      if (Object.keys(this.formErrors).length > 0) {
        return;
      }

      return argins;
    },

    submittedScheduleReturnForm: function submittedScheduleReturnForm() {

      // Show success message.
      this.scheduleReturnFormSuccess = true;
    },

    clickMarkReturned: function clickMarkReturned(thingId) {
      this.selectedThing = _.find(this.things, { id: thingId });

      // Open the modal.
      this.confirmReturnModalOpen = true;
    },

    closeConfirmReturnModal: function closeConfirmReturnModal() {
      this.selectedThing = undefined;
      this.confirmReturnModalOpen = false;
      this.cloudError = '';
    },

    handleParsingConfirmReturnForm: function handleParsingConfirmReturnForm() {
      return {
        id: this.selectedThing.id,
        borrowedBy: null,
        expectedReturnAt: 0
      };
    },

    submittedConfirmReturnForm: function submittedConfirmReturnForm() {
      // Update the prevously-borrowed item in the UI.
      var borrowedItem = _.find(this.things, { id: this.selectedThing.id });
      borrowedItem.borrowedBy = null;

      // Close the modal.
      this.selectedThing = undefined;
      this.confirmDeleteThingModalOpen = false;
      this.cloudError = '';
    },

    clickContactBorrower: function clickContactBorrower(thingId) {//eslint-disable-line no-unused-vars
      // FUTURE: This is where we can add a modal
      // with a space to write a message to the borrower of the item.
    },

    clickContactOwner: function clickContactOwner(thingId) {//eslint-disable-line no-unused-vars
      // FUTURE: This is where we can add a modal
      // with a space to write a message to the owner of the item.
    }

  }
});
