import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURATION ---
// 1. Where is your data file?
import data from './src/data.json' assert { type: "json" };

// 2. Where should images be saved?
const OUTPUT_DIR = './public/logos';

// --- SETUP ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
        // Add the group itself if it has a URL? Usually groups don't, but let's check.
        if(group.url) allItems.push(group);
        
        // Add all children
        if(group.children) {
            allItems = allItems.concat(group.children);
        }
    });

    console.log(`🔍 Found ${allItems.length} items. Starting download...`);

    for (const item of allItems) {
        if (!item.url) continue;

        try {
            const domain = new URL(item.url).hostname;
            // Clean the label to make a valid filename (e.g., "AI Tools" -> "ai_tools.png")
            const filename = item.label.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.png';
            const filepath = path.join(OUTPUT_DIR, filename);

            // Use DuckDuckGo's Icon Service (High Quality PNGs, easier to download than Google)
            const iconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`; 
            // OR use Google: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`

            await downloadImage(iconUrl, filepath);
            console.log(`✅ Saved: ${filename}`);
        } catch (error) {
            console.log(`❌ Failed: ${item.label} (${error})`);
        }
    }
    console.log("\n✨ All done! Images saved to /public/logos/");
};

processItems();