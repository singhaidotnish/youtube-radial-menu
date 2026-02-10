import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURATION ---
const OUTPUT_DIR = './public/logos';
const DATA_FILE = './src/data.json';

// --- SETUP ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Load Data (Using fs instead of import to avoid SyntaxErrors)
const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
const data = JSON.parse(rawData);

if (!fs.existsSync(OUTPUT_DIR)){
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else if (res.statusCode === 301 || res.statusCode === 302) {
                // Handle basic redirects (DuckDuckGo sometimes redirects)
                downloadImage(res.headers.location, filepath)
                    .then(resolve)
                    .catch(reject);
            } else {
                reject(`Status Code: ${res.statusCode}`);
            }
        }).on('error', (err) => {
            reject(err.message);
        });
    });
};

const processItems = async () => {
    // Flatten all items (Parents + Children) into one list
    let allItems = [];
    data.forEach(group => {
        if(group.url) allItems.push(group);
        if(group.children) {
            allItems = allItems.concat(group.children);
        }
    });

    console.log(`🔍 Found ${allItems.length} items. Starting download...`);

    for (const item of allItems) {
        // Skip if no URL
        if (!item.url) continue;

        try {
            const domain = new URL(item.url).hostname;
            
            // Clean filename: "AI Tools" -> "ai_tools.png"
            const filename = item.label.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.png';
            const filepath = path.join(OUTPUT_DIR, filename);

            // Skip if already exists (saves time on re-runs)
            if (fs.existsSync(filepath)) {
                console.log(`⏩ Skipped (Exists): ${filename}`);
                continue;
            }

            // High Quality Icon Service (DuckDuckGo)
            const iconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`; 

            await downloadImage(iconUrl, filepath);
            console.log(`✅ Saved: ${filename}`);
        } catch (error) {
            console.log(`❌ Failed: ${item.label} (${error})`);
        }
    }
    console.log("\n✨ All done! Images saved to /public/logos/");
};

processItems();