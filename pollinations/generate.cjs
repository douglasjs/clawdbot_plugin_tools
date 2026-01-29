const fs = require('fs');
const https = require('https');
const path = require('path');

const prompt = process.argv[2];

if (!prompt) {
  console.error("Please provide a prompt.");
  process.exit(1);
}

const encodedPrompt = encodeURIComponent(prompt);
// Use a random seed to ensure different images for same prompt
const seed = Math.floor(Math.random() * 1000000);
const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}`;

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `pollinations-${timestamp}.jpg`;
// Save to the persistent path requested by user
const outputPath = path.join('/home/node/clawd/persistent/small_pciture_share_app/uploads/', filename);

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const file = fs.createWriteStream(outputPath);

https.get(url, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to get image. Status Code: ${response.statusCode}`);
    process.exit(1);
  }

  response.pipe(file);

  file.on('finish', () => {
    file.close();
    // Output for Clawdbot to present to user
    // We provide the URL for immediate preview
    console.log(`MEDIA: ${url}`); 
    // We log the saved path
    console.log(`SAVED: ${outputPath}`);
    // We provide the web link as requested
    console.log(`LINK: https://cortana-pics.dextlas.com/`);
  });
}).on('error', (err) => {
  fs.unlink(outputPath, () => {}); 
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
