const express = require('express');
const socket = require('socket.io');
const Datastore = require('nedb');
const path = require('path');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your.email@your-domain.com',
    pass: 'your app password'
  },

});

const app = express();
const server = app.listen(3000);
const io = socket(server);

app.use(express.static(path.join(__dirname, 'public')));

const db = new Datastore({filename: path.join(__dirname, 'account.db')});
db.loadDatabase();



io.on('connection', (socket) => {
  console.log(socket.id);

  let verifyCode;
  let accstuff;

  socket.on('signup', (data) => {
    console.log(data);

    verifyCode = 'V-' + Math.floor(Math.random() * 1000000);
    accstuff = data;

    transporter.sendMail({
                           from: 'Verify Template <your.email@your-domain.com>',
                           to: data.email,
                           subject: 'Verify Your Account for ' + data.username,
                           html: '<h1>Verify Your Account for ' + data.username + '</h1><p>Your verification code is ' + verifyCode + '. If you did not request this email, please ignore it.</p>'
                         }, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });

  socket.on('verify', (data) => {
    if (data.code === verifyCode) {
      db.insert({username: accstuff.username, email: accstuff.email, password: accstuff.password}, (err, newDoc) => {
        if (err) {
          console.log(err);
        } else {
          console.log('New document inserted: ' + newDoc);
        }
      });

      socket.emit('verified', {
        success: true
      });
    } else {
      socket.emit('verified', {
        success: false
      });
    }
  });
});