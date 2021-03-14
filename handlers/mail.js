const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { renderFile } = require('pug'); 
const juice = require('juice');
const { htmlToText }= require('html-to-text');
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN } = process.env;

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  
  const oAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  const accessToken = await new Promise((resolve, reject) => {
    oAuth2Client.getAccessToken((err, token) => {
      if(err){
        reject('Failed to create access token :(")');
      }
      resolve(token);
    })
  });

  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.MAIL_USER,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken
    }
  });
  return transport;
}

const generateHTML = (options = {}) => {
  const html = renderFile(`${ __dirname}/../views/email/${options.filename}.pug`, options);
  const inlineStyledHTML = juice(html);
  return inlineStyledHTML;
}

const send = async (options) => {
  let transport = await createTransporter();
  const html = generateHTML(options); 
  const text = htmlToText(html);
  const mailOptions = {
    from: 'Oishi Romato <oishiromato@gmail.com>',
    to: options.user.email,
    subject: options.subject,
    html,
    text
  };  
  return transport.sendMail(mailOptions);
}
   
module.exports = { send } ;