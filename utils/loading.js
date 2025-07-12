import ora from 'ora';

/**
 * แสดง spinner พร้อมรอเวลาที่กำหนด
 * @param {string} message - ข้อความที่จะแสดงใน spinner
 * @param {number} duration - ระยะเวลาที่จะรอ (ms)
 * @param {string} doneMessage - ข้อความเมื่อเสร็จ (optional)
 */
export async function waitWithSpinner(message = 'Waiting...', duration = 3000, doneMessage = 'Done!') {
  const spinner = ora(message).start();
  await new Promise(resolve => setTimeout(resolve, duration));
  spinner.succeed(doneMessage);
}
