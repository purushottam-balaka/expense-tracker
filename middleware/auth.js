const jwt=require('jsonwebtoken');
const users=require('../model/users');

exports.authenticate=async(req,res,next)=>{
    try{
        const token=req.header('Authorization');
        const user=jwt.verify(token,process.env.JWT_KEY)
        const data=await users.findByPk(user.UserId)        
        req.user=data;
        next();
    }catch(err){
        // console.log(err)
        return res.status(404).json({message:'User not found',err:err})
    }
}