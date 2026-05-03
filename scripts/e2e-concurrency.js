const { chromium } = require('playwright');

// --- CONFIGURATION ---
// 1. Add some real usernames of students from your database here
const USERNAMES = [
  'zac', 'ben', 'ajie', 'rakhi', 'daniel', 'jaya', 'jaclyn', 'kokkiang',
  'likhong', 'josiah', 'leonardo', 'isaac', 'jaga', 'mohan', 'kamlesh',
  'shilpa', 'kendra', 'laifong', 'keanhin', 'daoyuan', 'limhung', 'tenglee',
  'gwen', 'noel', 'linus', 'waikay', 'aru', 'nsuresh', 'khayseong', 'chunrong',
  'kimmeng', 'brian', 'bernie', 'lily', 'hitesh', 'hueyling', 'franklin',
  'lipteck', 'desmond', 'karpoh', 'menghai', 'adrian', 'julius', 'roy',
  'jackson', 'edwin'
];
// 2. Make sure this matches your current Global Settings password
const PASSWORD = 'student123'; 
// 3. Make sure your local server is running (npm run dev)
const TARGET_URL = 'http://localhost:3000';
// ---------------------

async function simulateStudent(browser, username) {
  // Create an isolated "incognito" tab for each student
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`[${username}] Navigating to login...`);
    await page.goto(`${TARGET_URL}/login`);

    // Perform Login
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for successful login redirect
    await page.waitForURL(`${TARGET_URL}/vote`);
    console.log(`[${username}] Logged in successfully!`);

    // Wait for the select triggers to load
    await page.waitForSelector('.select-trigger');
    
    // Get all the select triggers (Rank 1, Rank 2, Rank 3)
    const triggers = await page.$$('.select-trigger');

    console.log(`[${username}] Clicking votes...`);
    for (let i = 0; i < Math.min(3, triggers.length); i++) {
      // Open the dropdown
      await triggers[i].click();
      await page.waitForTimeout(300); // Wait for dropdown animation

      // Find all options in the open dropdown (excluding the empty option)
      const availableOptions = await page.$$('.select-option:not(.empty-option)');
      
      // Filter out disabled ones (those with a disabled badge)
      const clickableOptions = [];
      for (const opt of availableOptions) {
        const hasDisabledBadge = await opt.$('.disabled-badge');
        if (!hasDisabledBadge) {
          clickableOptions.push(opt);
        }
      }

      if (clickableOptions.length > 0) {
        // Randomly select one valid option
        const randomOpt = clickableOptions[Math.floor(Math.random() * clickableOptions.length)];
        await randomOpt.click();
      }

      await page.waitForTimeout(200); // Simulate tiny human delay
    }

    // Submit votes
    console.log(`[${username}] Submitting votes...`);
    // Wait for the button to be ready and click it
    const submitBtn = await page.$('button.btn:has-text("Save Votes")');
    if (submitBtn) {
      await submitBtn.click();
      // Verify success by checking if success message appears
      await page.waitForSelector('text=Your votes have been successfully saved!', { timeout: 5000 });
      console.log(`✅ [${username}] Successfully cast votes!`);
    } else {
       console.log(`⚠️ [${username}] Submit button not found, maybe already voted?`);
    }

  } catch (error) {
    console.error(`❌ [${username}] Failed:`, error.message);
  } finally {
    await context.close();
  }
}

async function main() {
  console.log('🚀 Starting Concurrency Test...');
  
  // Launch a single headless browser instance
  const browser = await chromium.launch({ headless: true });

  // Map each username to a simulation function
  // Promise.all ensures they all run concurrently at the exact same time
  const promises = USERNAMES.map(user => simulateStudent(browser, user));

  // Wait for all students to finish
  await Promise.all(promises);

  await browser.close();
  console.log('🎉 Concurrency Test Complete!');
}

main();
