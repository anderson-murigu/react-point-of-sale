import { DataSource, Repository } from "typeorm";

export interface IFetchPageQuery {
  search: string;
  perPage: number;
  page: number;
}

export class CrudServices<T> {
  protected classType: new () => T;
  protected alias: string;
  protected repository: Repository<T>;

  setEntity(classType: new () => T) {
    this.classType = classType;
    this.alias = this.classType.name.toLowerCase();
  }

  private async getRepository(): Promise<Repository<T>> {
    if (!this.repository) {
      const { AppDataSource } = await import("../persistence");
      this.repository = AppDataSource.getRepository(this.classType);
    }
    return this.repository;
  }

  public async fetchAll() {
    const repository = await this.getRepository();
    return await repository.find();
  }

  public async fetchPages(query: IFetchPageQuery) {
    const recordsToSkip = (query.page - 1) * query.perPage;
    const repository = await this.getRepository();

    if (query.search) {
      return await repository
        .createQueryBuilder(this.alias)
        .where(`${this.alias}.id like :id`, { id: `%${query.search}%` })
        .skip(recordsToSkip)
        .take(query.perPage)
        .getMany();
    } else {
      return await repository
        .createQueryBuilder(this.alias)
        .skip(recordsToSkip)
        .take(query.perPage)
        .getMany();
    }
  }

  public async fetchById(id: string | number) {
    const repository = await this.getRepository();
    return await repository
      .createQueryBuilder(this.alias)
      .where(`${this.alias}.id = :id`, { id })
      .getOne();
  }

  public async create(userId: string = "admin", entity: T): Promise<any> {
    const repository = await this.getRepository();
    (entity as any).createdBy = userId;
    (entity as any).updatedBy = userId;
    return await repository.insert(entity);
  }

  public async updateById(
    userId: string = "admin",
    where: object,
    data: any
  ): Promise<any> {
    try {
      const repository = await this.getRepository();
      data.updatedBy = userId;
      data.id = (where as any).id;
      return await repository.update({ ...where }, data);
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT" && error.errno === 19) {
        throw {
          code: "SQLITE_CONSTRAINT",
          message: `This record can't be updated since it has references with other parts of data. Please ensure that those are deleted and try this operation`
        };
      }
      throw error;
    }
  }

  public async deleteById(id: string): Promise<any> {
    try {
      const repository = await this.getRepository();
      return await repository.delete(id);
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT" && error.errno === 19) {
        throw {
          code: "SQLITE_CONSTRAINT",
          message: `This record can't be deleted since it has references with other parts of data. Please ensure that those are deleted and try this operation`
        };
      }
      throw error;
    }
  }
}