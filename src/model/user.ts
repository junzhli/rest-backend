import { DataTypes, Model, Optional } from "sequelize";
import { Literal } from "sequelize/types/lib/utils";
import db from "../lib/db";

interface UserAttributes {
    id: number;
    cashBalance: number | Literal | string;
    name: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id!: number;
    name!: string;
    cashBalance!: number;

    readonly createdAt!: Date;
    readonly updatedAt!: Date;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    cashBalance: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        get() {
            const value = this.getDataValue("cashBalance");
            if (typeof value !== "string") {
                return value;
            }

            return parseFloat(value);
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    sequelize: db.getSequelizeInstance(),
    modelName: "User"
});

export default User;