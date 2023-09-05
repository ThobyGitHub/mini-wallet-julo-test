const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
//for handle multipart/form-data
const multer  = require('multer')
const upload = multer()

const verifyToken = require("../../middleware/auth");

const wallet = require('../../Wallet');

//initial wallet
//param customer_xid
router.post("/init", upload.none(), async (req, res) => {
    try {
      // Get form input
      const customer_xid = req.body.customer_xid;

      // Validate user input
      if (!customer_xid) {
        return res.status(400).json({status: "fail", data: { customer_xid: "A customer_xid is required"}});
      }
  
      // Create token
      const token = jwt.sign(
        { customer_xid: customer_xid },
        process.env.TOKEN_KEY,
        {
          expiresIn: process.env.TOKEN_TIME,
        }
      );
  
      // return token
      return res.status(200).json({status: "success", data: {token: token}});

    } catch (err) {
      console.log(err);
      return res.status(500).json(
        {status: "error", message: "Something went wrong", data: {error: err}}
        );
    }
});

//enable my wallet 
//param headers authorization
router.post("/", verifyToken, async (req, res) => {
    try{
        let user_token = req.user;
        if(user_token.customer_xid){
            //get user wallet id
            const user_wallet = await wallet.getWalletByCustomerId(user_token.customer_xid);
            if(!user_wallet){
                return res.status(400).json({status: "fail", data: { customer_xid: "No customer with the id found"}});
            }else{
                //update user wallet
                await wallet.enableUserWallet(user_wallet.id);
                const updated_wallet = await wallet.getWalletByCustomerId(user_token.customer_xid);
                return res.status(200).json({status: "success", data: {wallet: updated_wallet}});
            }
        }else{
            return res.status(400).json({status: "fail", data: { customer_xid: "A customer_xid is not found"}});
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json(
            {status: "error", message: "Something went wrong", data: {error: err}}
        );
    }
});

//disable my wallet 
//param headers authorization
router.patch("/", verifyToken, upload.none(), async (req, res) => {
    try{
        let user_token = req.user;
        const is_disabled = req.body.is_disabled;

        if(!is_disabled){
            return res.status(400).json({status: "fail", data: { customer_xid: "Is_disabled are required"}});
        }
        if(user_token.customer_xid){
            //get user wallet id
            const user_wallet = await wallet.getWalletByCustomerId(user_token.customer_xid);
            if(!user_wallet){
                return res.status(400).json({status: "fail", data: { customer_xid: "No customer with the id found"}});
            }else{
                //update user wallet
                if(is_disabled.toLowerCase() == "false"){
                    await wallet.enableUserWallet(user_wallet.id);
                }else{
                    await wallet.disableUserWallet(user_wallet.id);
                }
                const updated_wallet = await wallet.getWalletByCustomerId(user_token.customer_xid);
                return res.status(200).json({status: "success", data: {wallet: updated_wallet}});
            }
        }else{
            return res.status(400).json({status: "fail", data: { customer_xid: "A customer_xid is not found"}});
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json(
            {status: "error", message: "Something went wrong", data: {error: err}}
        );
    }
});

//view my wallet balance
//param headers authorization
router.get("/", verifyToken, async (req, res) => {
    try{
        let user_token = req.user;
        if(user_token.customer_xid){
            //get user wallet id after 5 seconds
            console.log('wait for 5 s to respond');
            let user_wallet = null;
            setTimeout(async function(){
                user_wallet = await wallet.getWalletByCustomerId(user_token.customer_xid);
                if(!user_wallet){
                    return res.status(400).json({status: "fail", data: { customer_xid: "No customer with the id found"}});
                }else{
                    return res.status(200).json({status: "success", data: {wallet: user_wallet}});
                }
            }, 5000);
        }else{
            return res.status(400).json({status: "fail", data: { customer_xid: "A customer_xid is not found"}});
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json(
            {status: "error", message: "Something went wrong", data: {error: err}}
        );
    }
});

//view my wallet transactions
//param headers authorization
router.get("/transactions", verifyToken, async (req, res) => {
    try{
        let user_token = req.user;
        if(user_token.customer_xid){
            let user_wallet = null;
            user_wallet = await wallet.getWalletByCustomerId(user_token.customer_xid);
            if(!user_wallet){
                return res.status(400).json({status: "fail", data: { customer_xid: "No customer with the id found"}});
            }else{
                if(user_wallet.status == "disabled"){
                    return res.status(404).json({status: "fail", data: { error: "Wallet disabled"}});
                }
                let deposits = await wallet.getDepositHistoryByWalletId(user_wallet.id);
                let withdrawals = await wallet.getWithdrawalHistoryByWalletId(user_wallet.id);
                return res.status(200).json({status: "success", data: {deposit: deposits, withdrawal: withdrawals}});
            }
        }else{
            return res.status(400).json({status: "fail", data: { customer_xid: "A customer_xid is not found"}});
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json(
            {status: "error", message: "Something went wrong", data: {error: err}}
        );
    }
});

//add virtual money to my wallet
//param headers authorization, amount, reference_id
router.post("/deposits", verifyToken, upload.none(), async (req, res) => {
    try{
        let user_token = req.user;
        const amount = req.body.amount;
        const reference_id = req.body.reference_id;

        if(!amount || !reference_id){
            return res.status(400).json({status: "fail", data: { customer_xid: "Amount and reference_id are required"}});
        }

        if(user_token.customer_xid){
            let user_wallet = await wallet.getWalletByCustomerId(user_token.customer_xid);
            if(!user_wallet){
                return res.status(400).json({status: "fail", data: { customer_xid: "No customer with the id found"}});
            }else{
                const deposit = await wallet.addMoneyToUserWallet(user_wallet.id, user_token.customer_xid, amount, reference_id);
                return res.status(200).json({status: "success", data: {deposit: deposit}});
            }
        }else{
            return res.status(400).json({status: "fail", data: { customer_xid: "A customer_xid is not found"}});
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json(
            {status: "error", message: "Something went wrong", data: {error: err}}
        );
    }
});

//use virtual money from my wallet
//param headers authorization, amount, reference_id
router.post("/withdrawals", verifyToken, upload.none(), async (req, res) => {
    try{
        let user_token = req.user;
        const amount = req.body.amount;
        const reference_id = req.body.reference_id;

        if(!amount || !reference_id){
            return res.status(400).json({status: "fail", data: { customer_xid: "Amount and reference_id are required"}});
        }

        if(user_token.customer_xid){
            let user_wallet = await wallet.getWalletByCustomerId(user_token.customer_xid);
            if(!user_wallet){
                return res.status(400).json({status: "fail", data: { customer_xid: "No customer with the id found"}});
            }else{
                const withdrawal = await wallet.useMoneyFromUserWallet(user_wallet.id, user_token.customer_xid, amount, reference_id);
                return res.status(200).json({status: "success", data: {withdrawal: withdrawal}});
            }
        }else{
            return res.status(400).json({status: "fail", data: { customer_xid: "A customer_xid is not found"}});
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json(
            {status: "error", message: "Something went wrong", data: {error: err}}
        );
    }
});
module.exports = router;