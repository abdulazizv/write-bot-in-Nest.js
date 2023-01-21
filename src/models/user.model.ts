import { AllowNull, Column, DataType, Model, Table } from 'sequelize-typescript';

interface UserAttr {
  user_id: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  username: string;
  status: boolean;
  last_state: string;
  message_id: string;
}
@Table({ tableName: 'user', timestamps: false })
export class User extends Model<User, UserAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement:true,
    unique: true,
  })
  id: number;

  @Column({
    type:DataType.STRING
  })
  user_id:string;
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
  status: boolean;

  @Column({
    type:DataType.STRING
  })
  real_name:string;

  @Column({
    type:DataType.STRING,
  })
  user_lang:string;

  @Column({
    type:DataType.STRING
  })
  ads_phone_number:string;
}
