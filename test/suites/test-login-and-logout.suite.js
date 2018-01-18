describe('login and logout', ()=>{

  // Before we begin, make sure we're completely logged out.
  // And go ahead and log out after we finish this entire suite
  // (or even if we fail a test along the way and bail because of that.)
  before(async()=>{ await Cloud.logout(); });
  after(async()=>{ await Cloud.logout(); });


  describe('logging in as Ryan Dahl', ()=>{
    it('should respond with a 200', async ()=>{
      await Cloud.login.with({
        emailAddress: 'admin@example.com',
        password: 'abc123',
      });
    });
    it('should mean that you\'re now authenticated, and thus should be able to update your password (and then to change it back, so we don\'t forget)', async ()=>{
      await Cloud.updatePassword('something else');
      await Cloud.updatePassword('abc123');
    });
  });


  describe('logging out', ()=>{
    it('should respond with a 200', async ()=>{
      await Cloud.logout();
    });
    it('should mean that you\'re no longer authenticated, and thus shouldn\'t be able to update your password', async ()=>{

      var failed;
      await Cloud.updatePassword('something that won\'t work because we are not logged in anymore')
      .tolerate((err)=>{
        assert(err.responseInfo, `err.responseInfo`);
        assert(err.responseInfo.statusCode === 401, `err.responseInfo.statusCode === 401`);
        failed = true;
      });

      if (!failed) {
        throw new Error('There should have been an error...');
      }

    });
    it('should respond idempotently even if you\'re already logged out (i.e. if you log out again, it still responds with a 200)', async ()=>{
      await Cloud.logout();
    });
  });

});
