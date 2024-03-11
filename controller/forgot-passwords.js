const Users=require('../model/users')
const ForgetPasswords=require('../model/forget-passwords')
const bcrypt=require('bcrypt')
require('dotenv').config()

exports.forgotPassword=async(req,res)=>{
    try{
        const mail=req.body.gmail;
        const user=await Users.findOne({where:{gmail:mail}})
        if(user){
        const uuid=require('uuid').v4
        const uid=uuid()
        
        await ForgetPasswords.create({
            id:uid,
            isActive:true,
            userId:user.id,

        })
        const Sib=require('sib-api-v3-sdk')
        const client=Sib.ApiClient.instance
        const apiKey=client.authentications['api-key']
        apiKey.apiKey=process.env.SEND_IN_BLUE_KEY

        const tranEmailApi=new Sib.TransactionalEmailsApi()

        const sender={
            email:'purushottam.balaka@gmail.com',
            name:'Purushottam'
        }
        const receivers=[
            {
                email:mail,
            },
        ]
        tranEmailApi.sendTransacEmail({
            sender,
            to:receivers,
            subject:'Forget password',
            textContent:'To change your password,use given link below',
            htmlContent:`
            <b>Reset password</b>
            <a href="http://localhost:9000/forget-password/${uid}">http://localhost:9000/forget-password/${uid}</a>
            `
        })
        return res.status(201).json({message:'Reset link sent successfully'})
    }
    else{
        return res.status(404).json({message:'User does not existed'})
    }
}catch(err){
    console.log(err)
    return res.status(500).json({message:'Internal server error',err:err})
}
}


exports.resetPassword=async(req,res)=>{
    try{
        const id=req.params.id;
        const forgotUser=await ForgetPasswords.findOne({where:{id:id}})
        if(forgotUser){
            await forgotUser.update({where:{isActive:false}})
            .then(()=>{
                res.send(`
                <html>
                    <body>
                        <h2>Enter your passowrd</h2>
                        <form action='/forget-password/${id}' method='post'>
                        <input type='password' id='upd_pwd' name='upd_pwd' required></input>
                        <input type='submit' value='Reset password'></input> 
                        </form>
                    </body>
                </html>
                `);
                res.end()
            })
            
        }
    }
    catch(err){
        console.log(err)
        return res.status(500).json({message:"Internal server error",err:err})
    }
}

exports.updatePassword=async(req,res)=>{
    try{
        const id=req.params.id;
        const newPassword=req.body.upd_pwd
        const user_id= await ForgetPasswords.findOne({where:{id:id}})

        const user=await Users.findOne({where:{id:user_id.userId}})

        if(user){
            bcrypt.hash(newPassword,10,async(err,hash)=>{
                if(err){
                    return res.status(500).json({message:'Internal error while encriptying password',err:err})
                }
                await ForgetPasswords.update({isActive:false},{where:{id:id}})
                await user.update({password:hash})
                
                return res.status(200).json({Message:'Password updated successfully.'})
            })
        }
    }catch(err){
        console.log(err)
        res.status(500).json({message:'Internal error occurred when encripting password',err:err})   
    }
    
}