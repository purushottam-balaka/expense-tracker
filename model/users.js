const Sequelize=require('sequelize');

const db=require('../util/database');
const sequelize = require('../util/database');

const Users=db.define('user',{
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    name:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    gmail:{
        type:Sequelize.STRING,
        allowNull:false,
        unique:true,
       
    },
    password:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    isPrimeUser:Sequelize.BOOLEAN, 
    totalExpense:{
        type:Sequelize.INTEGER,
        defaultValue:0,
    },

});

module.exports=Users;