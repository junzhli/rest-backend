import { DataTypes, Model, Optional } from "sequelize";
import db from "../lib/db";

interface MenuAttributes {
    id: number;
    dishName: string;
    price: number | string;
    restId: number;
}

interface MenuCreationAttributes extends Optional<MenuAttributes, "id"> {}

class Menu extends Model<MenuAttributes, MenuCreationAttributes> implements MenuAttributes {
    id!: number;
    dishName!: string;
    price!: number;
    restId!: number;

    readonly createdAt!: Date;
    readonly updatedAt!: Date;
}

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
        type: DataTypes.DECIMAL,
        allowNull: false,
        get() {
            const value = this.getDataValue("price");
            if (typeof value !== "string") {
                return value;
            }

            return parseFloat(value);
        }
    },
    restId: {
        type: DataTypes.INTEGER,
    }
}, {
    sequelize: db.getSequelizeInstance(),
    modelName: "Menu"
});

export default Menu;