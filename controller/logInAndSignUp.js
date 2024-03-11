const Users=require('../model/users');
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')

exports.home=(req,res)=>{
    res.status(200).sendFile(process.cwd()+'/views/login.html');
}

exports.signup=async(req,res,next)=>{
    try{
        const name=req.body.name;
        const gmail=req.body.gmail;
        const password=req.body.password;

        if(name==="" || gmail==="" || password===""){
            return res.status(400).json({message:"please fill all the details of the form"});
        }
        const uniqueGmail=await Users.findAll({where:{gmail:gmail}});
        if (uniqueGmail.length!==0){
            return res.status(409).json({message:"User already exist,Please login / use forget password "});
        }
        else{
            const saltRounds=10;
            bcrypt.hash(password,saltRounds, async(err,EcyPass)=>{
                if(err){
                    return res.status(500).json({message:'Internal error when signingup',err:err})
                }

            await Users.create({
                    name:name,
                    gmail:gmail,
                    password:EcyPass,
                })
            return res.status(201).json({message:'Signup successfully done'});
            })
            
            }    
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message:'Internal server error when signup',err:err});
    }
}

exports.login=async(req,res)=>{
    try{
        const gmail=req.body.gmail;
        const password=req.body.password;

        if(gmail.length==='' || password.length===''){
            return res.status(400).json({message:'Gmail or Password is missing'});
        }
        const uniqueGmail=await Users.findOne({where:{gmail:gmail}});
        if(uniqueGmail){
            bcrypt.compare(password,uniqueGmail.password, (err,result)=>{
                if (err){
                    return res.status(500).json({message:'Internal server error when checking password'})
                }
                else if (result){
                    const id=generateToken(uniqueGmail.id);
                    return res.status(200).json({message:'User logged in successfully',token:id});
                    
                }else{
                    return res.status(401).json({message:'Password is incorrect '});
                }
            })
        }else{
            return res.status(404).json({message:'User did not exist'})
        }

    }catch(err){
        console.log(err)
        return res.status(500).json({message:'Internal server error when logging in',err:err})
    }
}

function generateToken(id){
    return jwt.sign({UserId:id},'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
}

