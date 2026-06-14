const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

function normalizeFileName(fileName) {
  if (!fileName) return null;

  const decodedFileName = Buffer.from(fileName, "latin1").toString("utf8");

  if (decodedFileName.includes("�")) {
    return fileName;
  }

  return decodedFileName;
}

function toDiaryFile(file) {
  if (!file) return {};

  return {
    storedFileName: file.filename,
    originalFileName: normalizeFileName(file.originalname),
    fileSize: file.size,
  };
}

async function getDiaries(page = 0, size = 10) {
  const limit = Number(size);
  const offset = Number(page) * limit;

  const [rows] = await pool.query(
    `SELECT id, title, DATE_FORMAT(diary_date, '%Y-%m-%d') AS diary_date
     FROM diaries
     ORDER BY id DESC
     LIMIT :limit OFFSET :offset`,
    { limit, offset },
  );

  const [nextRows] = await pool.query(
    `SELECT id
     FROM diaries
     ORDER BY id DESC
     LIMIT 1 OFFSET :nextOffset`,
    { nextOffset: offset + limit },
  );

  return {
    items: rows,
    hasMore: nextRows.length > 0,
  };
}

async function getDiaryById(id) {
  const [rows] = await pool.query(
    `SELECT id, title, DATE_FORMAT(diary_date, '%Y-%m-%d') AS diary_date,
            content, stored_file_name, original_file_name, file_size
     FROM diaries
     WHERE id = :id`,
    { id },
  );
  return rows[0];
}

async function createDiary({ title, diaryDate, content }, file) {
  const fileData = toDiaryFile(file);

  const [result] = await pool.query(
    `INSERT INTO diaries
      (title, diary_date, content, stored_file_name, original_file_name, file_size)
     VALUES
      (:title, :diaryDate, :content, :storedFileName, :originalFileName, :fileSize)`,
    {
      title,
      diaryDate,
      content,
      storedFileName: fileData.storedFileName ?? null,
      originalFileName: fileData.originalFileName ?? null,
      fileSize: fileData.fileSize ?? null,
    },
  );

  return getDiaryById(result.insertId);
}

async function updateDiary(id, { title, diaryDate, content }, file) {
  const current = await getDiaryById(id);
  if (!current) return null;

  let fileData = {
    storedFileName: current.stored_file_name,
    originalFileName: current.original_file_name,
    fileSize: current.file_size,
  };

  if (file) {
    if (current.stored_file_name) {
      const oldPath = path.join(UPLOAD_DIR, current.stored_file_name);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    fileData = toDiaryFile(file);
  }

  await pool.query(
    `UPDATE diaries
     SET title = :title,
         diary_date = :diaryDate,
         content = :content,
         stored_file_name = :storedFileName,
         original_file_name = :originalFileName,
         file_size = :fileSize
     WHERE id = :id`,
    {
      id,
      title,
      diaryDate,
      content,
      storedFileName: fileData.storedFileName,
      originalFileName: fileData.originalFileName,
      fileSize: fileData.fileSize,
    },
  );

  return getDiaryById(id);
}

async function deleteDiary(id) {
  const current = await getDiaryById(id);
  if (!current) return false;

  await pool.query(`DELETE FROM diaries WHERE id = :id`, { id });

  if (current.stored_file_name) {
    const filePath = path.join(UPLOAD_DIR, current.stored_file_name);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  return true;
}

async function getDownloadInfo(id) {
  const diary = await getDiaryById(id);
  if (!diary || !diary.stored_file_name) return null;

  const filePath = path.join(UPLOAD_DIR, diary.stored_file_name);
  if (!fs.existsSync(filePath)) return null;

  return {
    filePath,
    originalFileName: diary.original_file_name || diary.stored_file_name,
  };
}

module.exports = {
  getDiaries,
  getDiaryById,
  createDiary,
  updateDiary,
  deleteDiary,
  getDownloadInfo,
};
