import { DataTypes, Model } from "sequelize";
import db from "../lib/db";

class OpeningHour extends Model {}

OpeningHour.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    weekDay: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false
    }
}, {
    sequelize: db.getSequelizeInstance(),
    modelName: "OpeningHour"
});

export default OpeningHour;