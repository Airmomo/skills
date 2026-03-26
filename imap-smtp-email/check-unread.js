const { execSync } = require('child_process');
const path = require('path');

try {
  const skillPath = path.join(__dirname, 'skills/imap-smtp-email');
  const result = execSync(`node scripts/imap.js check --limit 10 --json`, {
    cwd: skillPath,
    encoding: 'utf-8',
    timeout: 30000
  });
  
  const emails = JSON.parse(result);
  
  // Filter unseen emails
  const unseenEmails = emails.filter(email => !email.flags || !email.flags.includes('\\Seen'));
  
  if (unseenEmails.length === 0) {
    console.log('NO_UNREAD_EMAILS');
  } else {
    console.log(`UNREAD_COUNT:${unseenEmails.length}`);
    unseenEmails.forEach((email, index) => {
      console.log(`EMAIL_${index + 1}:UID=${email.uid}|FROM=${email.from}|SUBJECT=${email.subject}|DATE=${email.date}`);
    });
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
