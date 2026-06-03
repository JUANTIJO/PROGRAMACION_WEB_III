const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let sqlJsPromise = null;

function getSqlJs() {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs();
  }
  return sqlJsPromise;
}

class Database {
  constructor(filename, mode, callback) {
    this.filename = filename;

    getSqlJs().then(SQL => {
      try {
        let buffer = null;
        if (filename !== ':memory:') {
          const resolvedPath = path.resolve(filename);
          if (fs.existsSync(resolvedPath)) {
            buffer = fs.readFileSync(resolvedPath);
          }
        }
        this._db = new SQL.Database(buffer || undefined);
        callback(null);
      } catch (err) {
        callback(err);
      }
    }).catch(err => {
      callback(err);
    });
  }

  run(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    if (!callback) callback = () => {};

    try {
      this._db.run(sql, params || []);
      const meta = {
        lastID: 0,
        changes: this._db.getRowsModified(),
        constructor: { name: 'Statement' }
      };
      try {
        const stmt = this._db.prepare('SELECT last_insert_rowid() as id');
        stmt.step();
        const result = stmt.getAsObject();
        stmt.free();
        if (result && result.id) meta.lastID = Number(result.id);
      } catch (e) {}
      callback.call(meta, null);
    } catch (err) {
      callback(err);
    }
  }

  all(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    if (!callback) callback = () => {};

    try {
      const stmt = this._db.prepare(sql);
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      const meta = { constructor: { name: 'Statement' } };
      callback.call(meta, null, rows);
    } catch (err) {
      callback(err);
    }
  }

  close(callback) {
    try {
      if (this.filename && this.filename !== ':memory:') {
        const data = this._db.export();
        const resolvedPath = path.resolve(this.filename);
        fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
        fs.writeFileSync(resolvedPath, Buffer.from(data));
      }
      this._db.close();
      if (callback) callback(null);
    } catch (err) {
      if (callback) callback(err);
    }
  }

  serialize(callback) {
    callback();
  }
}

module.exports = {
  Database,
  OPEN_READWRITE: 2,
  OPEN_CREATE: 4
};
