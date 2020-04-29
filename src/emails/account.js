const sgMail = require('@sendgrid/mail');
const sendgridKey = process.env.SENDGRID_KEY;

sgMail.setApiKey(sendgridKey);

const sendWelcomeEmail = (email, name) => {
  try {
    sgMail.send({
      to: email,
      from: 'alejandro.sanchez@globant.com',
      subject: 'Welcome to Task Manager App',
      text: `Hello ${name}, Welcome to Task Manager App`,
    });
  } catch (error) {
    console.log(error);
  }
};

const sendFarewellEmail = (email, name) => {
  try {
    sgMail.send({
      to: email,
      from: 'alejandro.sanchez@globant.com',
      subject: 'Good bye! :(',
      text: `Good bye ${name}, It's sad to lose you. Good look!`,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendFarewellEmail,
};
