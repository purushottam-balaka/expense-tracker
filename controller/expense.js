const Users=require('../model/users');
const Expenses=require('../model/expenses');
const db=require('../util/database')
const sequelize=require('sequelize')
const path=require('path')
const fs=require('fs')

exports.addExpense=async(req,res)=>{
    const t=await db.transaction()
    try{
        const cost=req.body.cost;
        const description=req.body.description;
        const category=req.body.category;
        await Expenses.create(
            {
                cost: cost,
                description: description,
                category: category,
                userId: req.user.id,
            },{transaction:t}
        );
        const user=await Users.findByPk(req.user.id,{transaction:t})
        const old_total=user.totalExpense
        const new_total=Number(old_total)+Number(cost)
        await user.update(
            { totalExpense: new_total },
            {transaction:t},
        );
        await t.commit()
        return res.status(201).json({message:'Expense added successfully'})
    }catch(err){
        await t.rollback()
        console.log(err)
        return res.status(500).json({message:'Internal server error when adding expense',err:err});
    }
}

exports.getExpenses=async(req,res,next)=>{
    try{
    const ITEMS_PER_PAGE=+req.query.rows
    const page= +req.query.page || 1
    let totalItems;
    const user=await Users.findOne({where:{id:req.user.id}})
    await Expenses.count( {where:{UserId:req.user.id}})
    .then((total)=>{
        totalItems=total;
        return Expenses.findAll({
            offset: (page-1)*ITEMS_PER_PAGE,
            limit:ITEMS_PER_PAGE,
            where:{UserId:req.user.id},
        })    
    })
    .then((item)=>{
        res.status(200).json({ 
            products:item,
            user:user,
            currentPage:page,
            hasNextPage:page*ITEMS_PER_PAGE<totalItems,
            nextPage:page + 1,
            hasPreviousPage:page>1,
            previousPage:page - 1,
            lastPage:Math.ceil(totalItems/ITEMS_PER_PAGE),
 
        })
    })
    }catch(err){
        console.log(err);
        res.status(500).json({message:'Internal server error when getting expenses',err:err})
    }
}

exports.deleteExpense=async(req,res,next)=>{
    const t=await db.transaction()
    try{
        const del_id=req.params.id;
        const del_exp=await Expenses.findOne({where:{id:del_id}})
        const user=await Users.findOne({where:{id:req.user.id}})
        const old_total=user.totalExpense
        const new_total=Number(old_total)-Number(del_exp.cost)
        await Expenses.destroy({where:{id:del_id}},{transaction:t})
        await user.update(
            {totalExpense:new_total},
            {where:{id:req.user.id}},
            {transaction:t}
        )
        await t.commit()
        return res.status(204).end()
    }catch(err){
        await t.rollback()
        console.log(err);
        return res.status(500).json({message:'Internal server error when deleting expense',err:err})
    }
}   

exports.updateExpense=async(req,res)=>{
    const t=await db.transaction()
    try{
        const exp_id= req.params.id
        const updated_cost=req.body.cost
        const updated_desc=req.body.description
        const updated_cate=req.body.category
        const expense=await Expenses.findOne({where:{id:exp_id}},{transaction:t})
        const prev_cost=expense.cost
        await expense.update({cost:updated_cost,description:updated_desc,category:updated_cate} ,{where:{id:exp_id}},{transaction:t})
        const user=await Users.findOne({where:{id:req.user.id}})
        const old_total=user.totalExpense
        const new_total=Number(old_total)+Number(updated_cost)-Number(prev_cost)
        await user.update({totalExpense:new_total},{where:{id:req.user.id}},{transaction:t})
        await t.commit()
        return res.status(200).json({message:'Successfully updated resource'})
    }catch(err){
        await t.rollback()
        console.log(err)
        return res.status(500).json({message:'Internal server error when updating expense',err:err})
    }
}

exports.getEditExpense=async(req,res,next)=>{
    try{
        const exp_id=req.params.id;
        const exp=await Expenses.findOne({where:{id:exp_id}})
        return res.status(200).json({data:exp,exp_id:exp_id});
    }catch(err){
        console.log(err)
        return res.status(500).json({message:'Internal server error',err:err})
    }
}


exports.leaderBoard=async(req,res)=>{
    try{
    const leaderBoard=await Users.findAll({
        order:[['totalExpense','DESC']]
    })
    return res.status(200).json({user:leaderBoard})
    }catch(err){
        console.log(err)
        return res.status(500).json({message:'Internal error when getting leader board'})
    }
}

exports.topFive=async(req,res,next)=>{
    try{
        const data=await Expenses.findAll(
            {   
                attributes: ['cost','description','category',
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'createdAtDate'],
                ],
                where:{userId:req.user.id},
                order:[['cost','DESC']],
                limit:5,
            }
        )
        return res.status(200).json({records:data})
    }catch(err){
        console.log(err)
        return res.status(500).json({message:'Internal server error when gettng highest five expenses',err:err})
    }
}


exports.downloadExpenses=async(req,res)=>{
    try{
        const user=await Users.findByPk(req.user.id)
        if(!user.isPrimeUser==1){
            return res.status(404).json({message:'Premium user can only save expenses'})
        }
        const exp=await Expenses.findAll({where:{userId:req.user.id}})
        const stringifiedExpenses=JSON.stringify(exp);
        const filePath=  path.join(__dirname,'../views/expense.txt')
        fs.writeFile(filePath,stringifiedExpenses,(err)=>{
            if(err){
                console.log(err)
                return res.status(500).json({message:'Internal server error'})
            }
        return res.status(200).json(filePath)
        })       
    }catch(err){
        console.log(err)
        res.status(500).json({message:'Internal server error when saving expenses',err:err})
    }
   
}
