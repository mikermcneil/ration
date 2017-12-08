module.exports = {


  friendlyName: 'Upload thing',


  description: '',


  inputs: {

    photo: {
      description: 'Upstream for an incoming file upload.',
      type: 'ref',
      required: true
    },

    label: {
      type: 'string',
      description: 'A (very) brief description of the item.'
    },

  },


  exits: {

    success: {
      outputDescription: 'The ID of the newly created `Thing`.',
      outputExample: 1
    },

    imageUploadFailed: {
      description: 'The provided `photo` failed to upload.'
    },

  },


  fn: async function (inputs, exits) {

    // Upload the image.
    var uploadedFile = await sails.uploadOne(inputs.photo)
    .intercept(()=>'imageUploadFailed');

    // Create a new "thing" record.
    var newThing = await Thing.create({
      imageUploadFd: uploadedFile.fd,
      imageUploadMime: uploadedFile.type,
      label: inputs.label
    }).fetch();

    // Return the ID of the newly-created thing.
    return exits.success(newThing.id);

  }


};
