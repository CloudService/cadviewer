var mailManager = require("../lib/mailManager.js")();

mailManager.sendMail({
    from: 'no-reply@yourdomain.com',
    to: 'szkwkd@163.com',
    subject: 'test sendmail',
    content: 'Mail of test sendmail '

  }, function(err, reply) {
  	if(!err)
  		console.log("Success");
  	else{
  		console.log("Error");
  		console.log(err.stack);
  	}
});

