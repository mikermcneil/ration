module.exports = {


  friendlyName: 'Claim account and login',


  description: 'Finish setting up an unclaimed account, then sign in to the dashboard.',


  inputs: {

    password: {
      required: true,
      type: 'string',
      maxLength: 200,
      example: 'passwordlol',
      description: 'The unencrypted password to use for the new account.'
    },

    token: {
      required: true,
      description: 'The confirmation token from the email.',
      example: '4-32fad81jdaf$329'
    },

    fullName:  {
      required: true,
      type: 'string',
      example: 'Frida Kahlo de Rivera',
      description: 'The user\'s full name.',
    }

  },


  exits: {

    invalidOrExpiredToken: {
      responseType: 'expired',
      description: 'The provided token is expired, invalid, or already used up.',
    },

  },


  fn: async function (inputs, exits) {

    var userRecord = await User.findOne({ emailProofToken: inputs.token });
    if(!userRecord) {
      throw 'invalidOrExpiredToken';
    }

    // Update the existing user with the provided account information,
    // and clear out the emailProofToken and its friends.
    await User.update({ id: userRecord.id }).set({
      password: await sails.helpers.passwords.hashPassword(inputs.password),
      fullName: inputs.fullName,
      tosAcceptedByIp: this.req.ip,
      emailStatus: 'confirmed',
      emailProofToken: '',
      emailProofTokenExpiresAt: 0
    });

    // Log the user in for subsequent requests.
    this.req.session.userId = userRecord.id;

    return exits.success();

  }


};
