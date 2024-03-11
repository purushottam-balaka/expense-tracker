const express=require('express');

const route=express.Router();

const expense=require('../controller/expense');

const premium=require('../controller/premium');

const userAuthentication=require('../middleware/auth')

const forgotPassword=require('../controller/forgot-passwords')

const loginAndSignup=require('../controller/logInAndSignUp');

route.post('/signup',loginAndSignup.signup);

route.get('/',loginAndSignup.home);

route.post('/login',loginAndSignup.login);

route.post('/expense',userAuthentication.authenticate,expense.addExpense);

route.get('/expense',userAuthentication.authenticate,expense.getExpenses);

route.get('/expense/:id',userAuthentication.authenticate,expense.getEditExpense);

route.put('/expense/:id',userAuthentication.authenticate,expense.updateExpense);

route.delete('/expense/:id',userAuthentication.authenticate,expense.deleteExpense);

route.get('/leaderboard',userAuthentication.authenticate,expense.leaderBoard);

route.get('/download',userAuthentication.authenticate,expense.downloadExpenses);

route.get('/top-five',userAuthentication.authenticate,expense.topFive);

route.get('/purchase-premium',userAuthentication.authenticate,premium.purchagePremium);

route.post("/purchase-premium",userAuthentication.authenticate,premium.updatePurchase);

route.post('/forget-password',userAuthentication.authenticate,forgotPassword.forgotPassword);

route.get('/forget-password/:id',forgotPassword.resetPassword);

route.post('/forget-password/:id',forgotPassword.updatePassword);

module.exports=route;