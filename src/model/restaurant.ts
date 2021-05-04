import { DataTypes, Model } from "sequelize";
import db from "../lib/db";
import Menu from "./menu";
import OpeningHour from "./openingHour";

class Restaurant extends Model {}

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
    modelName: 'Restaurant'
});

Restaurant.hasMany(Menu, {foreignKey: "restId", sourceKey: "id"});
Menu.belongsTo(Restaurant, {foreignKey: "restId", targetKey: "id"});
Restaurant.hasMany(OpeningHour, {foreignKey: "restId", sourceKey: "id"});
OpeningHour.belongsTo(Restaurant, {foreignKey: "restId", targetKey: "id"})

export default Restaurant;