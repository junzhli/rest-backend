import { DataTypes, Model, Optional } from "sequelize";
import db from "../lib/db";

interface TransactionHistoryAttributes {
    id: number;
    amount: number;
    name: string;
    date: Date | string;
    menuId: number;
    userId: number;
    restId: number;
}

interface TransactionHistoryCreationAttributes extends Optional<TransactionHistoryAttributes, "id"> {}

class TransactionHistory extends Model<TransactionHistoryAttributes, TransactionHistoryCreationAttributes> implements TransactionHistoryAttributes {
    id!: number;
    amount!: number;
    name!: string;
    date!: Date;
    menuId!: number;
    userId!: number;
    restId!: number;

    readonly createdAt!: Date;
    readonly updatedAt!: Date;
}

TransactionHistory.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    menuId: {
        type: DataTypes.INTEGER
    },
    userId: {
        type: DataTypes.INTEGER
    },
    restId: {
        type: DataTypes.INTEGER
    }
}, {
    sequelize: db.getSequelizeInstance(),
    modelName: "TransactionHistory"
});

export default TransactionHistory;