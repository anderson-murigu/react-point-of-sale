import { DataSource } from 'typeorm';

const configDev = {
  type: 'sqlite' as const,
  database: 'database.sqlite',
  entities: [__dirname + '/../entity/*.ts'],
  migrations: [__dirname + '/../persistence/migration/*.ts'],
  logging: true,
  synchronize: false
};

const configProd = {
  type: 'sqlite' as const,
  database: 'database.sqlite',
  entities: [__dirname + '/../entity/*.js'],
  migrations: [__dirname + '/../persistence/migration/*.js'],
  logging: true,
  synchronize: false
};

const config = process.env.IS_PROD ? configProd : configDev;

export const AppDataSource = new DataSource(config);

export const openConnection = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};