import { DataTypes, Model, Optional } from "sequelize";
import db from "../lib/db";
import Restaurant from "./restaurant";

interface OpeningHourAttributes {
    id: number;
    weekDay: number;
    startTime: string;
    endTime: string;
    restId: number;
}

interface OpeningHourCreationAttributes extends Optional<OpeningHourAttributes, "id"> {}

class OpeningHour extends Model<OpeningHourAttributes, OpeningHourCreationAttributes> implements OpeningHourAttributes {
    id!: number;
    weekDay!: number;
    startTime!: string;
    endTime!: string;
    restId!: number;

    readonly createdAt!: Date;
    readonly updatedAt!: Date;

    readonly Restaurant?: Restaurant;
}

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
    },
    restId: {
        type: DataTypes.INTEGER,
    }
}, {
    sequelize: db.getSequelizeInstance(),
    modelName: "OpeningHour"
});

export default OpeningHour;