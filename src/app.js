import express from 'express'
import { pool } from './db.js'
import {PORT} from './config.js'

const app = express();

app.use(express.json());

app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
      res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
      next();
  });

app.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM users')
  res.json(rows)
})

app.get('/ping', async (req, res) => {
  const [result] = await pool.query(`SELECT "hello world" as RESULT`);
  res.json(result[0])
})

app.get('/insert', async (req, res) => {
  const result = await pool.query('INSERT INTO users(name) VALUES ("John")')
  res.json(result)
})

app.post('/create', async (req, res) => {
  try {
    const {name, status} = req.body;
    const [rows] = await pool.query(
      "INSERT INTO users (name, status) VALUES (?, ?)",
      [name, status]
    );
    res.json({status: 'User Saved'});
  } catch (error) {
   return res.status(500).json({ message: "Something goes wrong" });
 }
})

app.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("DELETE FROM users WHERE id_users = ?", [id]);
    res.json({status: 'User Delete'});
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
})

app.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const [result] = await pool.query(
      "UPDATE users SET name = IFNULL(?, name) WHERE id_users = ?",
      [name, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Users not found" });

    const [rows] = await pool.query("SELECT * FROM users WHERE id_users = ?", [
      id,
    ]);

    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
})

app.listen(PORT)
console.log('Server on port', PORT)
