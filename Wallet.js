const moment = require('moment');
const uuid = require('uuid');
const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
})

const getWalletByCustomerId = async (id) => {
    return new Promise(function(resolve, reject){
        pool.query('SELECT * FROM user_wallets WHERE owned_by = $1', [id], (error, results) => {
            if (error) {
                throw new Error(error);
            }
            resolve(results.rows[0]);
        });
    });
}

const getDepositHistoryByWalletId = async (id) => {
    return new Promise(function(resolve, reject){
        pool.query('SELECT * FROM deposit_transactions WHERE user_wallet_id = $1 ORDER BY deposited_at DESC LIMIT 10', [id], (error, results) => {
            if (error) {
                throw new Error(error);
            }
            resolve(results.rows);
        });
    });
}

const getWithdrawalHistoryByWalletId = async (id) => {
    return new Promise(function(resolve, reject){
        pool.query('SELECT * FROM withdraw_transactions WHERE user_wallet_id = $1 ORDER BY withdrawn_at DESC LIMIT 10', [id], (error, results) => {
            if (error) {
                throw new Error(error);
            }
            resolve(results.rows);
        });
    });
}

const enableUserWallet = async (id) => {
    return new Promise(async function(resolve, reject){
        const status = "enabled";
        const enabled_at = moment().format();
    
        const client = await pool.connect();
        try{
            await client.query('BEGIN');
            await client.query(
                "UPDATE user_wallets SET status = $1, enabled_at = $2 WHERE id = $3 and status <> 'enabled'",
                [status, enabled_at, id]
            );
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw(e);
        } finally {
            client.release();
            resolve();
        }
        
    });
}

const disableUserWallet = async (id) => {
    return new Promise(async function(resolve, reject){
        const status = "disabled";
        const disabled_at = moment().format();
    
        const client = await pool.connect();
        try{
            await client.query('BEGIN');
            await client.query(
                "UPDATE user_wallets SET status = $1, disabled_at = $2 WHERE id = $3 and status <> 'disabled'",
                [status, disabled_at, id]
            );
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw(e);
        } finally {
            client.release();
            resolve();
        }
        
    });
}

const addMoneyToUserWallet = async (id, customer_xid, amount, reference_id) => {
    let status = "fail";
    const deposited_at = moment().format();
    const client = await pool.connect();

    try{
        await client.query('BEGIN');

        const res1 = await client.query('INSERT INTO deposit_transactions (id, user_wallet_id, deposited_by, status, deposited_at, amount, reference_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [uuid.v4(), id, customer_xid, status, deposited_at, amount, reference_id]);
    
        const res2 = await client.query('UPDATE user_wallets SET balance = balance + $1 WHERE id = $2', [amount, id]);

        status = 'success';
        const res3 = await client.query('UPDATE deposit_transactions SET status = $1', [status]);

        await client.query('COMMIT');
        return res1.rows;
    } catch (e) {
        console.log(e);
        await client.query('ROLLBACK');
        throw(e);
    } finally {
        client.release();
    }
}

const useMoneyFromUserWallet = async (id, customer_xid, amount, reference_id) => {
    let status = "fail";
    const withdrawn_at = moment().format();
    const client = await pool.connect();

    try{
        await client.query('BEGIN');

        const res1 = await client.query('INSERT INTO withdraw_transactions (id, user_wallet_id, withdrawn_by, status, withdrawn_at, amount, reference_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [uuid.v4(), id, customer_xid, status, withdrawn_at, amount, reference_id]);
    
        const res2 = await client.query('UPDATE user_wallets SET balance = balance - $1 WHERE id = $2', [amount, id]);

        status = 'success';
        const res3 = await client.query('UPDATE withdraw_transactions SET status = $1', [status]);

        await client.query('COMMIT');
        return res1.rows;
    } catch (e) {
        console.log(e);
        await client.query('ROLLBACK');
        throw(e);
    } finally {
        client.release();
    }
}

module.exports = {
    getWalletByCustomerId,
    getDepositHistoryByWalletId,
    getWithdrawalHistoryByWalletId,
    enableUserWallet,
    disableUserWallet,
    addMoneyToUserWallet,
    useMoneyFromUserWallet
}
