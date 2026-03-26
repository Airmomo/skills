const { execSync } = require('child_process');
const path = require('path');

// Email UIDs to process (in order from newest to oldest)
const emailUIDs = [31980, 31979, 31978, 31977, 31976, 31975, 31974, 31973, 31972, 31971];

// Function to format date to China timezone
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const chinaTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return chinaTime.toISOString().replace('T', ' ').substring(0, 16);
}

// Function to format single email
function formatEmail(email, index, total) {
  let lines = [];
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`📧 邮件 ${index}/${total}`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push('');
  lines.push(`📌 **主题：** ${email.subject}`);
  lines.push(`📅 **时间：** ${formatDate(email.date)}`);
  lines.push(`👤 **发件人：** ${email.from}`);
  
  // Simplify recipients
  const recipients = email.to.split(',').slice(0, 2).map(t => t.trim());
  if (email.to.split(',').length > 2) recipients.push('...');
  lines.push(`👥 **收件人：** ${recipients.join('、')}`);
  
  // Attachments
  if (email.attachments && email.attachments.length > 0) {
    const attachInfo = email.attachments.map(a => `${a.filename} (${Math.round(a.size/1024)}KB)`).join(', ');
    lines.push(`📎 **附件：** ${attachInfo}`);
  }
  
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('📄 **邮件原文内容**');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  
  // Use text content if available, otherwise use snippet
  const content = email.text || email.snippet || '(无文本内容)';
  lines.push(content);
  lines.push('');
  
  return lines.join('\n');
}

// Main
const skillPath = path.join(__dirname, 'skills/imap-smtp-email');
const emails = [];

console.log('');
console.log('📧 **检测到 10 封未读邮件，现在逐一处理...**');
console.log('');

for (let i = 0; i < emailUIDs.length; i++) {
  const uid = emailUIDs[i];
  try {
    const result = execSync(`node scripts/imap.js fetch ${uid} --json 2>&1`, {
      cwd: skillPath,
      encoding: 'utf-8',
      timeout: 30000,
      maxBuffer: 50 * 1024 * 1024 // 50MB buffer
    });
    
    const email = JSON.parse(result);
    console.log(formatEmail(email, i + 1, emailUIDs.length));
    emails.push(email);
    
  } catch (error) {
    console.error(`❌ 获取邮件 UID ${uid} 失败: ${error.message}`);
  }
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ **已完成处理 ${emails.length}/10 封未读邮件**`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('将标记为已读的邮件UIDs:', emailUIDs.join(', '));
