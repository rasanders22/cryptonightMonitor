var LocalStrategy = require('passport-local').Strategy;
var User = require('../app/models/user');
var mysql = require('mysql')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/";
module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, email, password, done) {
        process.nextTick(function () {
            User.findOne({ 'local.email': email }, function (err, user) {
                if (err)
                    return done(err);
                if (user) {
                    return done(null, false, req.flash('emailMessage', 'That email is already taken.'));
                } else {
                    User.findOne({ 'local.username': req.body.username }, function (err, user) {
                        if (err)
                            return done(err);
                        if (user) {
                            return done(null, false, req.flash('usernameMessage', 'That username is already taken.'));
                        } else {
                            if (req.body.password != req.body.reenterPassword) {
                                return done(null, false, req.flash('passwordError', 'Passwords do not match'))
                            }
                            else {
                                if (req.body.password.length < 8) {
                                    return done(null, false, req.flash('passwordLengthError', 'Password is not strong enough, it must be at least 8 characters'))
                                }
                                else {
                                    var newUser = new User();
                                    newUser.local.email = email;
                                    newUser.local.password = newUser.generateHash(password);
                                    newUser.local.username = req.body.username;
                                    newUser.local.firstName = req.body.firstName;
                                    newUser.local.lastName = req.body.lastName;
                                    newUser.save(function (err) {
                                        if (err)
                                            throw err;
                                        else {
                                            var connection = mysql.createConnection({
                                                host: 'localhost',
                                                database: 'girlsMain',
                                                user: 'root',
                                                password: '1not4you',

                                            });
                                            var createMain = 'CREATE TABLE main' + newUser.id + ' LIKE main'
                                            var createPictures = 'CREATE TABLE pictures' + newUser.id + ' LIKE pictures'
                                            var createTimeline = 'CREATE TABLE timeline' + newUser.id + ' LIKE timeline'
                                            connection.query(createMain, function (err) {
                                                if (err) throw err;
                                            })
                                            connection.query(createPictures, function (err) {
                                                if (err) throw err;
                                            })
                                            connection.query(createTimeline, function (err) {
                                                if (err) throw err;
                                                connection.end();
                                            })
                                        }
                                        return done(null, newUser);
                                    });
                                }
                            }
                        }
                    })
                }
            });
        });
    }));
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function (req, email, password, done) {
        User.findOne({ 'local.username': email }, function (err, user) {
            if (err)
                return done(err);
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            if (!user.validPassword(password) && user)
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            return done(null, user);
        })
    }));
    passport.use('local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'email',
        passReqToCallback: true
    }, function (req, email, Null, done) {
        if (req.body.password == "") {
            if (req.body.oldEmail != req.body.email && req.body.oldUsername != req.body.username) {
                User.findOne({ 'local.email': req.body.email }, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    else if (user) {
                        return done(null, false, req.flash('emailExists', 'Email id already in use.'));
                    }
                    else {
                        User.findOne({ 'local.username': req.body.username }, function (err, user) {
                            if (err) {
                                return done(err);
                            }
                            else if (user) {
                                return done(null, false, req.flash('userExists', 'User Id already in use.'));
                            }
                            else {
                                MongoClient.connect(url, function (err, db) {
                                    if (err) throw err;
                                    var dbo = db.db("test");
                                    var myquery = { 'local.email': req.body.oldEmail }
                                    var newvalues = {
                                        $set: {
                                            'local.email': req.body.email,
                                            'local.username': req.body.username,
                                            'local.firstName': req.body.firstName,
                                            'local.lastName': req.body.lastName

                                        }
                                    }
                                    dbo.collection("users").update(myquery, newvalues, function (err, res) {
                                        if (err) throw err;
                                        console.log("1 document updated");
                                        db.close();
                                    });
                                });
                                return done(null, user)
                            }
                        })
                    }
                })
            }
            if (req.body.oldEmail != req.body.email && req.body.oldUsername == req.body.username) {
                User.findOne({ 'local.email': req.body.email }, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    else if (user) {
                        return done(null, false, req.flash('emailExists', 'Email id already in use.'));
                    }
                    else {
                        MongoClient.connect(url, function (err, db) {
                            if (err) throw err;
                            var dbo = db.db("test");
                            var myquery = { 'local.email': req.body.oldEmail }
                            console.log(req.body)
                            var newvalues = {
                                $set: {
                                    'local.email': req.body.email,
                                    'local.username': req.body.username,
                                    'local.firstName': req.body.firstName,
                                    'local.lastName': req.body.lastName

                                }
                            }
                            dbo.collection("users").update(myquery, newvalues, function (err, res) {
                                if (err) throw err;
                                console.log("1 document updated");
                                db.close();
                            });
                        });
                        return done(null, user)
                    }
                })
            }
            if (req.body.oldEmail == req.body.email && req.body.oldUsername != req.body.username) {
                User.findOne({ 'local.username': req.body.username }, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    else if (user) {
                        return done(null, false, req.flash('userExists', 'User Id already in use.'));
                    }
                    else {
                        MongoClient.connect(url, function (err, db) {
                            if (err) throw err;
                            var dbo = db.db("test");
                            var myquery = { 'local.email': req.body.oldEmail }
                            console.log(req.body)
                            var newvalues = {
                                $set: {
                                    'local.email': req.body.email,
                                    'local.username': req.body.username,
                                    'local.firstName': req.body.firstName,
                                    'local.lastName': req.body.lastName

                                }
                            }
                            dbo.collection("users").update(myquery, newvalues, function (err, res) {
                                if (err) throw err;
                                console.log("1 document updated");
                                db.close();
                            });
                        });
                        return done(null, user)
                    }
                })
            }
            if (req.body.oldEmail == req.body.email && req.body.oldUsername == req.body.username) {
                User.findOne({ 'local.username': req.body.username }, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    else {
                        if (req.body.firstName != req.body.oldFirstName || req.body.lastName != req.body.oldLastName) {
                            MongoClient.connect(url, function (err, db) {
                                if (err) throw err;
                                var dbo = db.db("test");
                                var myquery = { 'local.email': req.body.oldEmail }
                                console.log(req.body)
                                var newvalues = {
                                    $set: {
                                        'local.email': req.body.email,
                                        'local.username': req.body.username,
                                        'local.firstName': req.body.firstName,
                                        'local.lastName': req.body.lastName

                                    }
                                }
                                dbo.collection("users").update(myquery, newvalues, function (err, res) {
                                    if (err) throw err;
                                    console.log("1 document updated");
                                    db.close();
                                });
                            });
                            return done(null, user)

                        }
                        else {
                            return done(null, false, req.flash('userExists', 'No changes made'));
                        }
                    }
                })
            }
            else {
                console.log("error")
            }
        }
        else if (req.body.password != "") {
            User.findOne({ 'local.email': email }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (user.validPassword(req.body.oldPassword)) {
                    if (req.body.password == req.body.reenterPassword) {
                        MongoClient.connect(url, function (err, db) {
                            if (err) throw err;
                            var dbo = db.db("test");
                            var myquery = { 'local.email': req.body.oldEmail }
                            newPwHash = (user.generateHash(req.body.password))
                            var newvalues = {
                                $set: {
                                    'local.password': newPwHash
                                }
                            }
                            dbo.collection("users").update(myquery, newvalues, function (err, res) {
                                console.log(req.user.local.password)
                                console.log(newPwHash)
                                console.log(newvalues)
                                if (err) throw err;
                                console.log("1 document updated");
                                db.close();
                            });
                        });
                    }
                        return done(null, user)
                    if (req.body.password != req.body.reenterPassword) {
                        return done(null, false, req.flash('passwordMismatchMessage', 'Passwords do not match.'));
                    }
                    else
                        true
                        //return done(null, false, req.flash('generalErrorMessage', 'Something went wrong. Try again'));
                        
                }
                if (!user.validPassword(req.body.oldPassword)) {
                    return done(null, false, req.flash('wrongPasswordMessage', 'Oops! Wrong password.'));
                }
                else (
                    console.log("Error")
                )
            })
        }
    }))

}





