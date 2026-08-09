// Default avatar creation script
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Function to create a simple colored avatar
const createAvatar = async (color, number, outputPath) => {
    try {
        // Create a simple SVG avatar
        const svgContent = `
<svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
  <circle cx="75" cy="75" r="75" fill="${color}" />
  <circle cx="75" cy="55" r="25" fill="white" opacity="0.9" />
  <path d="M30 125 Q75 95 120 125" fill="white" opacity="0.9" />
  <text x="75" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="white" font-weight="bold">${number}</text>
</svg>`;

        // If Sharp is available, convert SVG to PNG, otherwise create a simple file
        try {
            const sharp = require('sharp');
            const buffer = Buffer.from(svgContent);
            await sharp(buffer)
                .png()
                .resize(150, 150)
                .toFile(outputPath);
        } catch (sharpError) {
            console.log('Sharp not available, creating simple avatar file...');
            // Create a simple text-based avatar file
            const simpleContent = `Avatar ${number} - Color: ${color}`;
            fs.writeFileSync(outputPath, simpleContent);
        }
        
        console.log(`Avatar ${number} created: ${outputPath}`);
    } catch (error) {
        console.error(`Error creating avatar ${number}:`, error.message);
        
        // Fallback: create a simple placeholder file
        const placeholderContent = `Default Avatar ${number}`;
        fs.writeFileSync(outputPath, placeholderContent);
        console.log(`Fallback avatar ${number} created`);
    }
};

// Create default avatars
const createDefaultAvatars = async () => {
    const avatarsDir = path.join(__dirname, '../assets/avatars');
    
    // Ensure directory exists
    if (!fs.existsSync(avatarsDir)) {
        fs.mkdirSync(avatarsDir, { recursive: true });
    }

    // Avatar configurations
    const avatarConfigs = [
        { color: '#4F46E5', number: 1 }, // Indigo
        { color: '#059669', number: 2 }, // Emerald  
        { color: '#DC2626', number: 3 }, // Red
        { color: '#7C3AED', number: 4 }, // Violet
        { color: '#EA580C', number: 5 }  // Orange
    ];

    console.log('Creating default avatars...');

    for (const config of avatarConfigs) {
        const filename = `avatar${config.number}.png`;
        const filepath = path.join(avatarsDir, filename);
        
        // Only create if file doesn't exist
        if (!fs.existsSync(filepath)) {
            await createAvatar(config.color, config.number, filepath);
        } else {
            console.log(`Avatar ${config.number} already exists: ${filepath}`);
        }
    }

    console.log('Default avatars setup complete!');
};

// Export the function
module.exports = { createDefaultAvatars };

// Run if this file is executed directly
if (require.main === module) {
    createDefaultAvatars().catch(console.error);
}
