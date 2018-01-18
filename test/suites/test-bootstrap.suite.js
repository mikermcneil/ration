describe('bootstrap', ()=>{

  it('should not fail', async ()=>{
    assert(sails);
  });

  it('should have left the database with the expected number of hard-coded users, including Ryan Dahl', async ()=>{
    var users = await User.find();
    assert(users.length > 0, `users.length > 0`);
    assert(users.length === 1, `users.length === 1`);// FUTURE: if other hard-coded users are added, update this.
    assert(_.find(users, { fullName: 'Ryan Dahl' }), `_.find(users, { fullName: 'Ryan Dahl' })`);
  });

});
