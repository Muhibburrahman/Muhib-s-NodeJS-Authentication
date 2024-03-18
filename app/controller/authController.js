const User = require('../models/user')
const passport = require('passport')
function authController() {
    return {
        signin(req, resp) {
            resp.render('auth/signin')
        },

        postSignin(req, resp, next) {
            const { username, password } = req.body
            if (!username || !password) {
                req.flash('error', 'All fields are required')
                return resp.redirect('/signin')

            }
            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    req.flash('error', info.message)
                    return next(err)
                }
                if (!user) {
                    req.flash('error', info.message)
                    return resp.redirect('/signin')
                }
                req.logIn(user, (err) => {
                    if (err) {
                        req.flash('error', info.message)
                        return next(err)
                    }

                    return resp.redirect('/home');
                })
            })(req, resp, next)
        },
        home(req, resp) {
            resp.render('auth/home')
        },
        signup(req, resp) {
            resp.render('auth/signup')
        },
        postSignup(req, resp) {
            const { username, email, password } = req.body
            console.log(req.body);
            if (!username || !email || !password) {
                req.flash('error', 'All fields are required')
                req.flash('username', username)
                req.flash('email', email)
                return resp.redirect('/')
            }
            User.exists({ email: email }, (err, result) => {
                if (result) {
                    req.flash('error', 'Email already taken')
                    req.flash('username', username)
                    req.flash('email', email)
                    return resp.redirect('/')
                }
            })
            User.register({
                username: req.body.username,
                email: req.body.email
            }, req.body.password, function (err) {
                if (err) {
                    req.flash('error', 'something went to wrong')
                    return resp.redirect('/')
                } else {
                    return resp.redirect('/signin')
                }
            });
        },

        reset(req, resp) {
            resp.render('auth/reset')
        },

        resetPassword(req, resp) {
            User.findByUsername(req.body.username, (err, user) => {
                if (err) {
                    req.flash('error', 'plz check your password')
                } else {
                    user.changePassword(req.body.oldpassword,
                        req.body.newpassword, function (err) {
                            if (err) {
                                return resp.redirect('/reset');
                            } else {
                                return resp.redirect('/signin')
                            }
                        });
                }
            });
        },
        logout(req, resp, next) {
            req.logout(function (err) {
                if (err) {
                    return next(err);
                }
                return resp.redirect('/')
            });

        }


    }
}
module.exports = authController