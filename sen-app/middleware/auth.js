function isAdmin(req, res, next) {

  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  if (req.session.user) {
    return res.redirect('/users/home?error=unauthorized');
  }
  return res.redirect('/?error=unauthorized');
}



module.exports={isAdmin};