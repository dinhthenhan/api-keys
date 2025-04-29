const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs'); // Thêm module fs để đọc/ghi file

// Thêm middleware CORS
const cors = require('cors');
app.use(cors());

// Middleware để parse JSON
app.use(express.json());

// Hàm tạo key ngẫu nhiên
const generateRandomKey = () => {
    return `KEY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
};

// Tạo 50 key ngẫu nhiên
const initializeKeys = () => {
    const keys = [];
    for (let i = 0; i < 50; i++) {
        keys.push({ key: generateRandomKey(), deviceID: null });
    }
    return keys;
};

// Đọc mảng keys từ file JSON (nếu không có file, khởi tạo với 50 key ngẫu nhiên)
let keys = [];
const keysFile = 'keys.json';

if (fs.existsSync(keysFile)) {
    const data = fs.readFileSync(keysFile);
    keys = JSON.parse(data);
} else {
    keys = initializeKeys(); // Tạo 50 key ngẫu nhiên
    fs.writeFileSync(keysFile, JSON.stringify(keys, null, 2));
}

// Hàm lưu mảng keys vào file JSON
const saveKeysToFile = () => {
    fs.writeFileSync(keysFile, JSON.stringify(keys, null, 2));
};

// API để tạo key mới
app.post('/create-key', (req, res) => {
    const newKey = generateRandomKey();
    keys.push({ key: newKey, deviceID: null });
    saveKeysToFile(); // Lưu vào file sau khi thêm key mới
    res.status(201).json({ key: newKey });
});

// API để kiểm tra mã khóa và deviceID khi đăng nhập
app.post('/login', (req, res) => {
    const { key, deviceID } = req.body;

    // Tìm mã khóa trong danh sách
    const keyData = keys.find(k => k.key === key);

    if (!keyData) {
        return res.status(400).json({ message: 'Key Không Tồn Tại !' });
    }

    // Kiểm tra nếu mã khóa đã được sử dụng trên thiết bị khác
    if (keyData.deviceID && keyData.deviceID !== deviceID) {
        return res.status(400).json({ message: 'Key Đã Được Sử Dụng !' });
    }

    // Nếu key chưa được sử dụng hoặc thiết bị khớp, cho phép đăng nhập
    if (!keyData.deviceID) {
        keyData.deviceID = deviceID; // Lưu deviceID cho key này
        saveKeysToFile(); // Lưu vào file sau khi cập nhật deviceID
    }
    res.status(200).json({ message: 'Đăng Nhập Thành Công' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});