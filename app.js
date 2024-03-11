const express=require('express');
const cors=require('cors');
const fs=require('fs');
const bodyParser=require('body-parser');
const db=require('./util/database');
const Users=require('./model/users');
const Expenses=require('./model/expenses');
const routes=require('./routes/routes');
const Orders=require('./model/order');
const path=require('path')
const ForgetPasswords=require('./model/forget-passwords')
require('dotenv').config();
const helmet=require('helmet');
const morgan=require('morgan');
const compression=require('compression');
const port=process.env.PORT;
const app=express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(routes);

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net",
    "checkout.razorpay.com","ajax.googleapis.com","maxcdn.bootstrapcdn.com"],
    scriptSrcAttr:["'self'", "'unsafe-inline'"],
    frameSrc: ["'self'","api.razorpay.com"],
    }
}))
app.use(cors());
app.use(compression());

app.use(express.static('views'));

Users.hasMany(Expenses);
Expenses.belongsTo(Users);

Orders.belongsTo(Users);
Users.hasMany(Orders);

ForgetPasswords.belongsTo(Users);
Users.hasMany(ForgetPasswords);

db.sync();
app.listen(port);