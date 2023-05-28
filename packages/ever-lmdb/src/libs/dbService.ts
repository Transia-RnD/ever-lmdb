// const lmdb = require('node-lmdb')
// // const { open } = require('lmdb');
// const settings = require('../settings.json').settings
// const fs = require('fs')

// class DbService {
//   static #env = null
//   static #db = null

//   static async initializeDatabase() {
//     if (this.#db == null && !fs.existsSync(settings.dbPath)) {
//       // IF YOU NEED TO INIT THE DB AND ADD DATA FOR TESTING
//       // this.#env = new lmdb.Env();
//       // env.open({
//       //     path: 'mydata',
//       //     mapSize: 2*1024*1024*1024, // maximum database size
//       //     maxDbs: 3
//       // });
//       // this.#env.close();

//       // this.#db = open({
//       //     path: 'lmdb',
//       //     compression: true,
//       // });
//       // this.#db.close();
//       console.log('INIT DB')
//     }
//   }
// }

// module.exports = {
//   DbService,
// }
