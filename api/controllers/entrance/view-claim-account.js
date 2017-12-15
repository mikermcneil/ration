module.exports = {


  friendlyName: 'View claim account',


  description: 'Display "Claim account" page.',

  inputs: {

    token: {
      description: 'The confirmation token from the email.',
      example: '4-32fad81jdaf$329'
    }

  },


  exits: {

    success: {
      viewTemplatePath: 'pages/entrance/claim-account'
    },

    invalidOrExpiredToken: {
      responseType: 'expired',
      description: 'The provided token is expired, invalid, or already used up.',
    },

  },


  fn: async function (inputs, exits) {

    // If no token was provided, this is automatically invalid.
    if (!inputs.token) {
      throw 'invalidOrExpiredToken';
    }

    var accountInfo = await User.findOne({ emailProofToken: inputs.token });
    if(!accountInfo) {
      throw 'invalidOrExpiredToken';
    }

    // Respond with view, and the information we have
    // about this unclaimed account.
    return exits.success({
      unclaimedAccount: {
        fullName: accountInfo.fullName,
        emailAddress: accountInfo.emailAddress,
        token: accountInfo.emailProofToken
      }
    });

  }


};
