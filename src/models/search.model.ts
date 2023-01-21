import { Column, DataType, Model, Table } from "sequelize-typescript";

interface SearchAttr {
  request?: number;
  founds?: string;
  request_count?: number;
}       

@Table({ tableName: "search" })
export class Search extends Model<Search, SearchAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @Column({ type: DataType.STRING })
  request: string;

  @Column({ type: DataType.SMALLINT, defaultValue: 0 })
  founds: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  request_count: number;
}   