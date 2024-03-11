const sequelize=require('sequelize');
const db=require('../util/database');

const Orders=db.define('order',{
    id:{
        type:sequelize.INTEGER,
        autoIncrement:true,
        allowNull:true,
        primaryKey:true,
    },
    paymentId:sequelize.STRING,
    orderId:sequelize.STRING,
    status:sequelize.STRING,
});

module.exports=Orders;