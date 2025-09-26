import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'

const DB_DIR = path.resolve(process.cwd(), 'server')
const DB_FILE = path.resolve(DB_DIR, 'data.sqlite')

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

sqlite3.verbose()
export const db = new sqlite3.Database(DB_FILE)

export function initSchema() {
  return run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    sku TEXT,
    title TEXT,
    brand TEXT,
    price INTEGER,
    oldPrice INTEGER,
    volume TEXT,
    country TEXT,
    badges TEXT,
    category TEXT,
    image TEXT
  )`)
}

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows))
  })
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row))
  })
}

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) { err ? reject(err) : resolve(this) })
  })
}

export async function seedIfEmpty(defaultItems) {
  await initSchema()
  const row = await get('SELECT COUNT(1) AS c FROM products')
  if (row && row.c > 0) return
  const insert = `INSERT INTO products (id, sku, title, brand, price, oldPrice, volume, country, badges, category, image)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  for (const p of defaultItems) {
    await run(insert, [p.id, p.sku, p.title, p.brand, p.price, p.oldPrice||0, p.volume||'', p.country||'', JSON.stringify(p.badges||[]), p.category||'', p.image||''])
  }
}

export async function getProducts() {
  const rows = await all('SELECT * FROM products ORDER BY id DESC')
  return rows.map(r => ({ ...r, badges: safeParse(r.badges) }))
}

export async function replaceAllProducts(items) {
  await run('DELETE FROM products')
  const insert = `INSERT INTO products (id, sku, title, brand, price, oldPrice, volume, country, badges, category, image)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  for (const p of items) {
    await run(insert, [p.id, p.sku, p.title, p.brand, p.price, p.oldPrice||0, p.volume||'', p.country||'', JSON.stringify(p.badges||[]), p.category||'', p.image||''])
  }
}

export async function upsertProduct(p) {
  const exists = await get('SELECT id FROM products WHERE id = ?', [p.id])
  if (exists) return updateProduct(p.id, p)
  const insert = `INSERT INTO products (id, sku, title, brand, price, oldPrice, volume, country, badges, category, image)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  await run(insert, [p.id, p.sku, p.title, p.brand, p.price, p.oldPrice||0, p.volume||'', p.country||'', JSON.stringify(p.badges||[]), p.category||'', p.image||''])
}

export async function createProduct(p) {
  const row = await get('SELECT MAX(id) AS m FROM products')
  const id = (row?.m || 0) + 1
  const insert = `INSERT INTO products (id, sku, title, brand, price, oldPrice, volume, country, badges, category, image)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  await run(insert, [id, p.sku || `NEW-${String(id).padStart(4,'0')}`, p.title || 'Новый товар', p.brand || 'Brand', Number(p.price||0), Number(p.oldPrice||0), p.volume||'', p.country||'', JSON.stringify(p.badges||[]), p.category||'', p.image||''])
  return { id, ...p }
}

export async function updateProduct(id, p) {
  const current = await get('SELECT * FROM products WHERE id = ?', [id])
  if (!current) throw new Error('Not found')
  const next = { ...current, ...p, id }
  await run(`UPDATE products SET sku=?, title=?, brand=?, price=?, oldPrice=?, volume=?, country=?, badges=?, category=?, image=? WHERE id=?`,
    [next.sku, next.title, next.brand, Number(next.price||0), Number(next.oldPrice||0), next.volume||'', next.country||'', JSON.stringify(next.badges||safeParse(next.badges)||[]), next.category||'', next.image||'', id])
  return next
}

export async function deleteProduct(id) {
  await run('DELETE FROM products WHERE id = ?', [id])
}

function safeParse(v) {
  try { return JSON.parse(v || '[]') } catch(e) { return [] }
}


