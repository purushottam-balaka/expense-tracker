const Razorpay = require('razorpay');
const Orders=require('../model/order');

exports.purchagePremium=async (req,res,next)=>{
try{    
        var rzp=new Razorpay({
            key_id:process.env.RAZORPAY_KEY_ID,
            key_secret:process.env.RAZORPAY_KEY_SECRET,
        })
        const amount=2500;
        rzp.orders.create({amount,currency:"INR"},(err,order)=>{
            if(err){
                throw new Error(JSON.stringify(err));
            }
          req.user.createOrder({orderId:order.id,status:'PENDING'}).then(()=>{
            return res.status(201).json({order,key_id:rzp.key_id});
            }).catch(err =>{
                throw new Error(err);
            })
        })
    }catch(err){
        console.log(err)
        return res.status(500).json({message:'Internal server error when purchasing'})
    }
}

exports.updatePurchase=async(req,res,next)=>{
    try{
        
        const {payment_id,order_id}=req.body;
        if(payment_id===null){
            Orders.findOne({where:{ orderId:order_id}}).then(order =>{
                order.update({paymentId:payment_id,status:'FAILED'}).then(() =>{
                    req.user.update({isPrimeUser:false}).then(()=>{
                        return res.status(202).json({success: false,message:'Transaction Failed'});
                    }).catch((err)=>{
                        
                        throw new Error(err)
                    })
                }).catch((err)=>{
                    
                    throw new Error(err)
                })
            }).catch((err)=>{
                
                throw new Error(err)
            })
        
        }
        else{
        Orders.findOne({where:{orderId:order_id}}).then(order =>{
            order.update({paymentId:payment_id,status:'SUCCESSFUL'}).then(() =>{
                req.user.update({isPrimeUser:true}).then(()=>{
                    return res.status(200).json({isPrimeUser:true,success: true,message:'Transaction Successful'});

                }).catch((err)=>{
                    
                    throw new Error(err)
                })
            }).catch((err)=>{
                
                throw new Error(err)
            })
        }).catch((err)=>{
            
            throw new Error(err)
            
        })
    }
    }catch(err){
        console.log(err)
    }
}

