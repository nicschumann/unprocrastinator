function ramdomString(length) {
  var str = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < length; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function randomEmail() {
  return randomString(4) + '@' + randomString(3) + '.' + randomString(3);
}