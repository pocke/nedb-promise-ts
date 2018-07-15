import NedbDatastore = require('nedb');

export default class Datastore {
  // TODO: persistence
  private original: Nedb;

  constructor(options: Nedb.DataStoreOptions) {
    this.original = new NedbDatastore(options);
  }

  async loadDatabase() {
    return this.promisify(this.original.loadDatabase.bind(this.original));
  }

  getAllData(): any[] {
    return this.original.getAllData();
  }

  resetIndexes(newData: any): void {
    this.original.resetIndexes(newData);
  }

  async ensureIndex(options: Nedb.EnsureIndexOptions) {
    return this.promisify(this.original.ensureIndex.bind(this.original));
  }

  async removeIndex(fieldName: string) {
    return this.promisify(this.original.removeIndex.bind(this.original));
  }

  addToIndexes<T>(doc: T | T[]): void {
    this.original.addToIndexes(doc);
  }

  removeFromIndexes<T>(doc: T | T[]): void {
    this.original.removeFromIndexes(doc);
  }

  updateIndexes<T>(oldDoc: T, newDoc: T): void;
  updateIndexes<T>(updates: Array<{ oldDoc: T; newDoc: T }>): void;
  updateIndexes<T>(...rest: T[]): void {
    (this.original.updateIndexes as any)(...rest);
  }

  getCandidates(query: any): void {
    this.original.getCandidates(query);
  }

  // TODO: Support cursor style.
  async count(query: any) {
    return this.promisify(this.original.count.bind(this, query));
  }

  // TODO: Support cursor style.
  async find(query: any, projection?: any) {
    const f = projection
      ? this.original.find.bind(this.original, query, projection)
      : this.original.find.bind(this.original, query);
    return this.promisify(f);
  }

  async findOne(query: any, projection?: any) {
    const f = projection
      ? this.original.findOne.bind(this.original, query, projection)
      : this.original.findOne.bind(this.original, query);
    return this.promisify(f);
  }

  async update(query: any, updateQuery: any, options?: Nedb.UpdateOptions) {
    const f = options
      ? this.original.update.bind(this.original, query, updateQuery, options)
      : this.original.update.bind(this.original, query, updateQuery);
    return this.promisify(f);
  }

  async remove(query: any, options?: Nedb.RemoveOptions) {
    const f = options
      ? this.original.remove.bind(this.original, query, options)
      : this.original.remove.bind(this.original, query);
    return this.promisify(f);
  }

  private async promisify(f: Function) {
    return new Promise((resolve, reject) => {
      f((err: Error, ...result: any[]) => {
        if (err) {
          reject(err);
        } else {
          if (result.length === 0) {
            resolve();
          } else if (result.length === 1) {
            resolve(result[0]);
          } else {
            resolve(...result);
          }
        }
      });
    });
  }
}
