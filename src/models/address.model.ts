import { Column, DataType, Model, Table } from "sequelize-typescript";

interface AddressAttr {
  request_id: number;
  coordinate_lat: number;
  coordinate_lon: number;
  address_name: string;
  address_text: string;
  bounded_to_lat: number;
  bunded_top_lon: number;
  bounded_bottom_lat: number;
  bounded_bottom_lon: number;
  full_text: string;
}

@Table({ tableName: "address" })
export class Address extends Model<Address, AddressAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @Column({ type: DataType.INTEGER })
  request_id: number;
  @Column({ type: DataType.INTEGER })
  coordinate_lat: number;
  @Column({ type: DataType.INTEGER })
  coordinate_lon: number;
  @Column({ type: DataType.STRING })
  address_name: string;
  @Column({ type: DataType.STRING })
  address_text: string;
  @Column({ type: DataType.INTEGER })
  bounded_to_lat: number;
  @Column({ type: DataType.INTEGER })
  bunded_top_lon: number;
  @Column({ type: DataType.INTEGER })
  bounded_bottom_lat: number;
  @Column({ type: DataType.INTEGER })
  bounded_bottom_lon: number;
  @Column({ type: DataType.STRING })
  full_text: string;
}