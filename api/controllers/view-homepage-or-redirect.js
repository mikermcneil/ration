module.exports = {


  friendlyName: 'View homepage or redirect',


  description: 'Display or redirect to the appropriate homepage, depending on login status.',


  exits: {

    success: {
      statusCode: 200,
      description: 'Requesting user is a guest, so show the public landing page.',
      viewTemplatePath: 'pages/homepage.ejs'
    },

    redirect: {
      responseType: 'redirect',
      description: 'Requesting user is logged in, so redirect to an internal page depending on that user\'s account status.'
    },

  },


  fn: async function (inputs, exits) {

    if (this.req.me) {
      // If this user has no friends, go to the page for sending friend requests.
      if(this.req.me.friends.length === 0) {
        throw {redirect:'/friends'};
      }
      // Otherwise, land on the 'things' page.
      else {
        throw {redirect:'/things'};
      }
    }

    return exits.success();

  }


};
