import { promises as fs } from 'fs';
import path from 'path';

/**
 * บันทึกข้อมูลเป็นไฟล์ JSON (async)
 * @param {string} filePath - เช่น './data/result.json'
 * @param {any} data - ข้อมูล JavaScript ที่ต้องการบันทึก
 */
export async function saveJSON(filePath, data) {
  const dir = path.dirname(filePath);
  try {
    await fs.mkdir(dir, { recursive: true });

    const jsonData = JSON.stringify(data, null, 2); // เว้นบรรทัดให้ดูง่าย
    await fs.writeFile(filePath, jsonData, 'utf-8');
    console.log(`✅ Saved JSON to ${filePath}`);
  } catch (err) {
    console.error('❌ Error saving JSON:', err.message);
  }
}

/**
 * โหลดข้อมูลจากไฟล์ JSON (async)
 * @param {string} filePath - เช่น './data/result.json'
 * @returns {Promise<any|null>} - คืนค่า object หรือ null ถ้าเกิด error
 */
export async function loadJSON(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`⚠️  File not found: ${filePath}`);
    } else {
      console.error('❌ Error reading JSON:', err.message);
    }
    return null;
  }
}
