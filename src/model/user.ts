import { DataTypes, Model } from "sequelize";
import db from "../lib/db";

class User extends Model {}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    cashBalance: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    sequelize: db.getSequelizeInstance(),
    modelName: 'User'
});

export default User;