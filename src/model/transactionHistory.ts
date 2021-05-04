import { DataTypes, Model } from "sequelize";
import db from "../lib/db";

class TransactionHistory extends Model {}

TransactionHistory.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: db.getSequelizeInstance(),
    modelName: 'TransactionHistory'
});

export default TransactionHistory;