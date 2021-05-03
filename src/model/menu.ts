import { DataTypes, Model } from "sequelize/types";
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
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    restId: {
        type: DataTypes.INTEGER,
        references: {
            model: Restaurant,
            key: "id"
        }
    }
}, {
    sequelize: db.getSequelizeInstance(),
    modelName: 'Menu'
});

export default Menu;