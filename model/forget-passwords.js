const sequelize=require('sequelize');

const db=require('../util/database');

const Forgot=db.define('forget-passwords',{
    id:{
        type:sequelize.UUID,
        primaryKey:true,
    },
    isActive:sequelize.BOOLEAN,
})

module.exports=Forgot;