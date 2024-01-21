require('dotenv').config();
const express = require('express');
const router=express.Router();
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');
const nodemailer= require('nodemailer');
const crypto = require('crypto');
const config=require('./config');
const user= require('./UserSchema');

router.post('/registartion', async (req, res) => {
    const { username, email, password } = req.body;
    
    try{
        if(!username || !email || !password){
            res.status(400).json({error:"All fields are required"});
        }
        const userExists = await user.findOne({email:email});
        if(userExists){
            res.status(400).json({error:"User already exists"});
        }
        
        const hashPassword = await bcrypt.hash(password,10);
        console.log(hashPassword);
        const user1= new user({
            username: username,
            email: email,
            password: hashPassword
        });
        const u1= await user1.save();
        res.json(u1)
        res.destroy();
        // res.json({message: "Registration"});
 
}
    catch(err){
        res.status(500).json({ error: "Error" });
        res.destroy();
    }
});


router.post('/login', async (req, res) => {
    const { username,password } = req.body;
    if(!username || !password){
        res.status(400).json({ error: "All fields required" });
    }
    const userLogin= await user.findOne({username: username});
    if(userLogin && (await bcrypt.compare(password,userLogin.password))){
        const accessToken=jwt.sign({
            user:{
                username: userLogin.username,
                email: userLogin.email,

            }
        }, process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:"1m"},
        console.log("Secret Key:", process.env.ACCESS_TOKEN_SECRET)
        );
        res.status(200).json({accessToken});   
        res.destroy(); 
    }
    else{
        res.status(401).json({error: "Invalid username or password"});
        res.destroy();
    }

})

const sendResetPasswordMail= async(email,token)=>{
    try{
      const transporter=  nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }
        });

        const mailOptions={
            from:config.emailUser,
            to:email,
            subject:'For reset password',
            html:'<p>Please copy the link <a href="http://localhost:3000/user/reset-password?token='+token+'">Here</a> and reset your password</p>'
        }
        const info = await transporter.sendMail(mailOptions);
        console.log('Mail sent successfully', info.response);
    }
    catch(err){
        console.log(err)
    }
}

router.post('/forget-password', async(req, res)=>{
    const {email } = req.body;
    if(!email){
        res.status(400).json({ error: "email required" });
    }
    const userPass= await user.findOne({email: email});
    if(userPass){
        const resetToken = crypto.randomBytes(10).toString('hex');
        userPass.token=resetToken;
        await userPass.save();
        sendResetPasswordMail(userPass.email, userPass.token);

        res.status(200).json("Check mail");
    }
    else{
    res.status(200).json({error: "Does not exist"});
    }
    try{

    }
    catch(err){
        res.status(400).json({error: "Error"});
    }
})

module.exports = router;