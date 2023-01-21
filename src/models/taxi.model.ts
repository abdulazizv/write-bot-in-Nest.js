import { Column, DataType, Model, Table } from "sequelize-typescript";

interface TaxiAttr {
  user_id: string;
  taxi_call_type: string;
  driver_id: string;
  from_lat: string;
  from_long: string;
  from_full_adr: string;
  to_lat: string;
  to_lon: string;
  to_full_adr: string;
  taxi_distance: number;
  taxi_time: number;
  taxi_price: number;
  taxi_start_time: Date;
  taxi_end_time: Date;
  taxi_state: string;
  info: string;
  message_id: number;
}

@Table({ tableName: "taxi" })
export class Taxi extends Model<Taxi, TaxiAttr> {
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
  taxi_call_type: string;
  @Column({
    type: DataType.STRING,
  })
  driver_id: string;
  @Column({
    type: DataType.STRING,
  })
  from_lat: string;
  @Column({
    type: DataType.STRING,
  })
  from_long: string;
  @Column({
    type: DataType.STRING,
  })
  from_full_adr: string;
  @Column({
    type: DataType.STRING,
  })
  to_lat: string;
  @Column({
    type: DataType.STRING,
  })
  to_lon: string;
  @Column({
    type: DataType.STRING,
  })
  to_full_adr: string;
  @Column({
    type: DataType.DECIMAL,
  })
  taxi_distance: number;
  @Column({
    type: DataType.DECIMAL,
  })
  taxi_time: number;
  @Column({
    type: DataType.DECIMAL,
  })
  taxi_price: number;
  @Column({
    type: DataType.DATE,
  })
  taxi_start_time: Date;
  @Column({
    type: DataType.DATE,
  })
  taxi_end_time: Date;
  @Column({
    type: DataType.STRING,
  })
  taxi_state: string;
  @Column({
    type: DataType.STRING,
  })
  info: string;
  @Column({
    type: DataType.INTEGER,
  })
  message_id: number;
}