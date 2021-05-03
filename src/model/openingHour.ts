import { DataTypes, Model } from "sequelize/types";
import db from "../lib/db";
import Restaurant from "./restaurant";

class OpeningHour extends Model {}

OpeningHour.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    startWeekday: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    endWeekday: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    endTime: {
        type: DataTypes.TIME,
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
    modelName: 'OpeningHour'
});

export default OpeningHour;