var fs = require('fs');
var path = require('path');
var multer = require('multer');
var request = require('request')
var ffmpeg = require('fluent-ffmpeg')
module.exports = function (app, passport) {

    app.get('/', function (req, res) {
            form = '\
            <!DOCTYPE html>\
            <html>\
                <head>\
                    <!DOCTYPE html>\
                        <html lang="en">\
                        <title>\
                            OHB.com\
                        </title>\
                </head>\
            <div class="wholePageMain">\
                <div id="popupModal" class="loginModal">\
                    <span class="close">&times;</span>\
                    <form action="/login" method="post" id="loginForm">\
                        <div style="display:inline;position:relative;">\
                        <input type="text" placeholder="Username/Email" name="email"><br>\
                        <input type="password" placeholder="Password" name="password"><br>\
                        <button>Login</buttons>\
                    </form>\
                </div>\
            </div>\
            </html>'
        res.end(form)
    });
    app.get('/login', function (req, res) {
        res.render('login.ejs', {
            message: req.flash('loginMessage')
        });
    });
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home',
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }))
    app.get('/home', isLoggedIn, function(req,res){
        var mainPage = require('../models/main.js')
        mainPage.mainPage(req, res, function (err, data) {
        })
    })

};
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

