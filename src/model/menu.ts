import { DataTypes, Model } from "sequelize";
import db from "../lib/db";
import Restaurant from "./restaurant";

class Menu extends Model {}

Menu.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    dishName: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    sequelize: db.getSequelizeInstance(),
    modelName: 'Menu'
});

export default Menu;