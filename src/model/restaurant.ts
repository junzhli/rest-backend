import { DataTypes, Model } from "sequelize/types";
import db from "../lib/db";

class Restaurant extends Model {}

Restaurant.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cashBalance: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    sequelize: db.getSequelizeInstance(),
    modelName: 'Restaurant'
});

export default Restaurant;