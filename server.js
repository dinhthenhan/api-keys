const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');

const cors = require('cors');
app.use(cors());

app.use(express.json());

const generateRandomKey = () => {
    return `KEY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
};

// Tạo 50 key ngẫu nhiên
const initializeKeys = () => {
    const keys = [];
    for (let i = 0; i < 150; i++) {
        keys.push({ key: generateRandomKey(), deviceID: null });
    }
    return keys;
};

let keys = [];
const keysFile = 'keys.json';

if (fs.existsSync(keysFile)) {
    const data = fs.readFileSync(keysFile);
    keys = JSON.parse(data);
} else {
    keys = initializeKeys(); 
    fs.writeFileSync(keysFile, JSON.stringify(keys, null, 2));
}

const saveKeysToFile = () => {
    fs.writeFileSync(keysFile, JSON.stringify(keys, null, 2));
};

app.post('/create-key', (req, res) => {
    const newKey = generateRandomKey();
    keys.push({ key: newKey, deviceID: null });
    saveKeysToFile();
    res.status(201).json({ key: newKey });
});

app.post('/login', (req, res) => {
    const { key, deviceID } = req.body;

    const keyData = keys.find(k => k.key === key);

    if (!keyData) {
        return res.status(400).json({ message: 'Key Không Tồn Tại !' });
    }

    if (keyData.deviceID && keyData.deviceID !== deviceID) {
        return res.status(400).json({ message: 'Key Đã Được Sử Dụng !' });
    }

    if (!keyData.deviceID) {
        keyData.deviceID = deviceID;
        saveKeysToFile();
    }
    res.status(200).json({ message: 'Đăng Nhập Thành Công' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});