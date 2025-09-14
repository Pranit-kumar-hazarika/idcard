const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));

// 🔹 PostgreSQL (Supabase Database)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 🔹 Supabase Storage
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const BUCKET = "students";

// Upload file to Supabase Storage
async function uploadToStorage(fileBase64, filename) {
  if (!fileBase64 || !fileBase64.startsWith("data:")) return null;
  const buffer = Buffer.from(fileBase64.split(",")[1], "base64");

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`, {
    method: "PUT", // ✅ Must be PUT
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "image/png",
    },
    body: buffer,
  });

  if (!res.ok) throw new Error(await res.text());
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
}

// Create student
app.post("/api/students", async (req, res) => {
  try {
    const { roll, name, fathername, course, bloodGroup, contactNumber, issueDate, session, photo, signature } = req.body;

    const photoUrl = photo ? await uploadToStorage(photo, `${roll}-photo.png`) : null;
    const signatureUrl = signature ? await uploadToStorage(signature, `${roll}-sign.png`) : null;

    const result = await pool.query(
      `INSERT INTO students 
       (roll, name, fathername, course, blood_group, contact_number, issue_date, session, photo_url, signature_url) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) 
       RETURNING id`,
      [roll, name, fathername, course, bloodGroup, contactNumber, issueDate, session, photoUrl, signatureUrl]
    );

    res.status(201).json({ id: result.rows[0].id, message: "Student created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all students
app.get("/api/students", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM students ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get by roll
app.get("/api/students/roll/:roll", async (req, res) => {
  const result = await pool.query("SELECT * FROM students WHERE roll=$1", [req.params.roll]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
  res.json(result.rows[0]);
});

// Search
app.get("/api/students/search", async (req, res) => {
  const term = `%${req.query.term}%`;
  const result = await pool.query(
    "SELECT id, roll, name, fathername, course FROM students WHERE roll ILIKE $1 OR name ILIKE $1",
    [term]
  );
  res.json(result.rows);
});

// Delete by id
app.delete("/api/students/:id", async (req, res) => {
  await pool.query("DELETE FROM students WHERE id=$1", [req.params.id]);
  res.json({ message: "Deleted" });
});

// Delete all
app.delete("/api/students", async (_req, res) => {
  const result = await pool.query("DELETE FROM students");
  res.json({ message: "All deleted", count: result.rowCount });
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
