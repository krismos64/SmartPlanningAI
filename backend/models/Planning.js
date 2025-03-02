const mysql = require("mysql2/promise");
const connectDB = require("../config/db");

class Planning {
  constructor(id, weekStart, schedules) {
    this.id = id;
    this.weekStart = weekStart;
    this.schedules = schedules;
  }

  static async findByWeekStart(weekStart) {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      "SELECT * FROM plannings WHERE weekStart = ?",
      [weekStart]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return new Planning(row.id, row.weekStart, row.schedules);
  }

  static async create(weekStart, schedules) {
    const connection = await connectDB();
    const [result] = await connection.execute(
      "INSERT INTO plannings (weekStart, schedules) VALUES (?, ?)",
      [weekStart, JSON.stringify(schedules)]
    );
    return result.insertId;
  }

  static async update(id, schedules) {
    const connection = await connectDB();
    await connection.execute(
      "UPDATE plannings SET schedules = ? WHERE id = ?",
      [JSON.stringify(schedules), id]
    );
  }

  static async delete(id) {
    const connection = await connectDB();
    await connection.execute("DELETE FROM plannings WHERE id = ?", [id]);
  }
}

module.exports = Planning;
