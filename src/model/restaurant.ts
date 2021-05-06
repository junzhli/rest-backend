import { DataTypes, Model, Optional } from "sequelize";
import { Literal } from "sequelize/types/lib/utils";
import db from "../lib/db";
import Menu from "./menu";
import OpeningHour from "./openingHour";
import TransactionHistory from "./transactionHistory";
import User from "./user";

interface RestaurantAttributes {
    id: number;
    name: string;
    cashBalance: number | Literal;
}

interface RestaurantCreationAttributes extends Optional<RestaurantAttributes, "id"> {}

class Restaurant extends Model<RestaurantAttributes, RestaurantCreationAttributes> implements RestaurantAttributes {
    id!: number;
    name!: string;
    cashBalance!: number;

    readonly createdAt!: Date;
    readonly updatedAt!: Date;
}

Restaurant.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    cashBalance: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    sequelize: db.getSequelizeInstance(),
    modelName: "Restaurant"
});

/** Relations */
Restaurant.hasMany(Menu, {foreignKey: "restId", sourceKey: "id"});
Menu.belongsTo(Restaurant, {foreignKey: "restId", targetKey: "id"});

Restaurant.hasMany(OpeningHour, {foreignKey: "restId", sourceKey: "id"});
OpeningHour.belongsTo(Restaurant, {foreignKey: "restId", targetKey: "id"});

Restaurant.hasMany(TransactionHistory, {foreignKey: "restId", sourceKey: "id"});
TransactionHistory.belongsTo(Restaurant, {foreignKey: "restId", targetKey: "id"});

User.hasMany(TransactionHistory, {foreignKey: "userId", sourceKey: "id"});
TransactionHistory.belongsTo(User, {foreignKey: "userId", targetKey: "id"});

Menu.hasMany(TransactionHistory, {foreignKey: "menuId", sourceKey: "id"});
TransactionHistory.belongsTo(Menu, {foreignKey: "menuId", targetKey: "id"});

export default Restaurant;