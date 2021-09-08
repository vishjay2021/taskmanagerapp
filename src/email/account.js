const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendConfirmMail = async (user)=>{
    const msg = {
        to: user.email, // Change to your recipient
        from: 'ideaproductionshouse@gmail.com', // Change to your verified sender
        subject: 'Confirm Your Account',
        html: `
         <p>Welcome to Task Manager App! ${user.name} Please Confirm your account by clicking below link</p>
         <a href="http://localhost:3000/api/users/confirm_account?userId=${user._id}&secret=${user.secret}">Confirm </a>
        `,
      }
      
      sgMail
        .send(msg).then((result) =>{
            console.log("email sent success")
        }).catch((error)=>{
            console.log(error);
        })
}

module.exports ={
    sendConfirmMail: sendConfirmMail
}