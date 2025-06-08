function isAdmin(req, res, next) {
  console.log('Session user:', req.session.user);

  if (req.session.user && req.session.user.role === "admin") {
    console.log('User is admin, proceeding...');
    return next();
  }
  if (req.session.user) {
    console.log('User logged in but not admin:', req.session.user.role);
    return res.redirect('/users/home?error=unauthorized');
  }
  console.log('User not logged in');
  return res.redirect('/?error=unauthorized');
}



module.exports={isAdmin};