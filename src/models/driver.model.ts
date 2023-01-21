import { Column, DataType, Model, Table } from "sequelize-typescript";

interface DriverAttr {
  user_id: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  username: string;
  real_name: string;
  user_lang: string;
  work_status: boolean;
  last_state: string;
  work_phone_number: string;
  car_model: string;
  car_number: string;
  car_color: string;
  car_photo: string;
  last_lat: string;
  last_lon: string;
}

@Table({ tableName: "driver" })
export class Driver extends Model<Driver, DriverAttr> {
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
  phone_number: string;

  @Column({
    type: DataType.STRING,
  })
  first_name: string;

  @Column({
    type: DataType.STRING,
  })
  last_name: string;

  @Column({
    type: DataType.STRING,
  })
  username: string;
  @Column({
    type: DataType.STRING,
  })
  last_state: string;
  @Column({
    type: DataType.STRING,
  })
  message_id: string;
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  work_status: boolean;

  @Column({
    type: DataType.STRING,
  })
  real_name: string;

  @Column({
    type: DataType.STRING,
  })
  user_lang: string;

  @Column({
    type: DataType.STRING,
  })
  ads_phone_number: string;
  @Column({
    type: DataType.STRING,
  })
  car_model: string;
  @Column({
    type: DataType.STRING,
  })
  car_number: string;
  @Column({
    type: DataType.STRING,
  })
  car_color: string;
  @Column({
    type: DataType.STRING,
  })
  car_photo: string;
  @Column({
    type: DataType.STRING,
  })
  last_lat: string;
  @Column({
    type: DataType.STRING,
  })
  last_lon: string;
}