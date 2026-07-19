// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Endpoint to get current config
app.get('/api/config', (req, res) => {
    try {
        const configPath = path.join(__dirname, 'config.js');
        const content = fs.readFileSync(configPath, 'utf8');
        const match = content.match(/const CONFIG = \{([^}]*)\}/s);
        if (match) {
            const configStr = match[1];
            const configObj = {};
            const lines = configStr.split('\n');
            lines.forEach(line => {
                const kv = line.match(/\s*(\w+):\s*['"]([^'"]*)['"],?/);
                if (kv) {
                    configObj[kv[1]] = kv[2];
                }
            });
            res.json(configObj);
        } else {
            res.status(500).json({ error: 'Could not parse config' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to save config
app.post('/api/config', (req, res) => {
    try {
        const config = req.body;
        const configPath = path.join(__dirname, 'config.js');
        
        let content = `// ============================================================\n`;
        content += `// CONFIGURATION - Edit these values anytime\n`;
        content += `// ============================================================\n`;
        content += `const CONFIG = {\n`;
        for (const [key, value] of Object.entries(config)) {
            content += `  ${key}: '${value.replace(/'/g, "\\'")}',\n`;
        }
        content += `};\n`;
        
        fs.writeFileSync(configPath, content, 'utf8');
        res.json({ success: true, message: 'Config saved successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

