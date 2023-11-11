let socket = io();

socket.on('connect', () => {
  console.log('Connected to server');
});

$(function(){
  $('#div1').show();
  $('#div2').hide();
  $('#div3').hide();
  
  $('#submit').click(function(){
    socket.emit('signup', {
      username: $('#username').val(),
      password: $('#password').val(),
      email: $('#email').val()
    });

    $('#div1').hide();
    $('#div2').show();
  });

  $('#verify').click(function() {
    socket.emit('verify', {
      code: $('#code').val()
    });
  });

  socket.on('verified', data => {
    if (data.success) {
      $('#div2').hide();
      $('#div3').show();
    } else {
      alert('Wrong Code!');
    }
  });

  
});
