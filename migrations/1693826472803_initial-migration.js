/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('user_wallets', {
        id: {type: 'varchar(100)', notNull: true },
        owned_by: { type: 'varchar(100)', notNull: true },
        status: { type: 'varchar(25)', default:'disabled' },
        enabled_at: { type: 'timestamp' },
        disabled_at: { type: 'timestamp' },
        balance: { type: 'float', default: 0 },
    })
    pgm.createTable('deposit_transactions', {
        id: {type: 'varchar(100)', notNull: true },
        user_wallet_id: {type: 'varchar(100)', notNull: true },
        deposited_by: { type: 'varchar(100)', notNull: true },
        status: { type: 'varchar(25)' },
        deposited_at: { type: 'timestamp' },
        amount: { type: 'float', default: 0 },
        reference_id: { type: 'varchar(100)' },
    })
    pgm.createIndex('deposit_transactions', 'user_wallet_id')

    pgm.createTable('withdraw_transactions', {
        id: {type: 'varchar(100)', notNull: true },
        user_wallet_id: {type: 'varchar(100)', notNull: true },
        withdrawn_by: { type: 'varchar(100)', notNull: true },
        status: { type: 'varchar(25)' },
        withdrawn_at: { type: 'timestamp' },
        amount: { type: 'float', default: 0 },
        reference_id: { type: 'varchar(100)' },
    })
    pgm.createIndex('withdraw_transactions', 'user_wallet_id')
};

exports.down = pgm => {};
