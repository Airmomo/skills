const { execSync } = require('child_process');
const path = require('path');

// Email UIDs to process
const emailUIDs = [31980, 31979, 31978, 31977, 31976, 31975, 31974, 31973, 31972, 31971];

// Function to format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  // Convert to China timezone (UTC+8)
  const chinaTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return chinaTime.toISOString().replace('T', ' ').substring(0, 16);
}

// Function to format single email
function formatEmail(email) {
  let output = [];
  output.push('---');
  output.push(`📌 **主题：** ${email.subject}`);
  output.push(`📅 **时间：** ${formatDate(email.date)}`);
  output.push('---');
  output.push(`👤 **发件人：** ${email.from}`);
  
  // Simplify recipients list
  const toList = email.to.split(',').slice(0, 3).map(t => t.trim());
  if (email.to.split(',').length > 3) {
    toList.push('...');
  }
  output.push(`👥 **收件人：** ${toList.join('、')}`);
  output.push('---');
  
  // Attachments
  if (email.attachments && email.attachments.length > 0) {
    const attachList = email.attachments.map(a => `${a.filename} (${Math.round(a.size/1024)}KB)`).join(', ');
    output.push(`📎 **附件：** ${attachList}`);
    output.push('---');
  }
  
  output.push('📄 **邮件原文内容**');
  output.push('');
  output.push(email.text || email.snippet || '(无文本内容)');
  output.push('---');
  output.push('');
  
  return output.join('\n');
}

// Main process
const skillPath = path.join(__dirname, 'skills/imap-smtp-email');
const allEmails = [];

console.log('📧 检测到 **10 封未读邮件**，现在逐一处理：');
console.log('');

for (let i = 0; i < emailUIDs.length; i++) {
  try {
    const result = execSync(`node scripts/imap.js fetch ${emailUIDs[i]} --json`, {
      cwd: skillPath,
      encoding: 'utf-8',
      timeout: 30000
    });
    
    const email = JSON.parse(result);
    console.log(`=== 邮件 ${i + 1}/10 ===`);
    console.log(formatEmail(email));
    allEmails.push(email);
  } catch (error) {
    console.error(`Error fetching email ${emailUIDs[i]}:`, error.message);
  }
}

console.log('');
console.log(`✅ 已处理 ${allEmails.length} 封邮件`);
console.log('');
console.log('标记为已读的UIDs:', emailUIDs.join(','));
