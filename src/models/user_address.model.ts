import { Column, DataType, Model, Table } from "sequelize-typescript";

interface UserAddressAttr {
  user_id: string;
  address_name: string;
  full_address: string;
  lat: string;
  lon: string;
  last_state: string;
  info: string;
}
@Table({ tableName: "user_address" })
export class UserAddress extends Model<UserAddress, UserAddressAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  })
  id: number;
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  user_id: string;

  @Column({
    type: DataType.STRING,
  })
  address_name: string;
  @Column({
    type: DataType.STRING,
  })
  full_address: string;
  @Column({
    type: DataType.STRING,
  })
  lat: string;
  @Column({
    type: DataType.STRING,
  })
  lon: string;
  @Column({
    type: DataType.STRING,
  })
  last_state: string;
  @Column({
    type: DataType.STRING,
  })
  info: string;
}