const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');


const app=express();
app.use(cors());
const PORT = 5000;

if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
}

if (!fs.existsSync(path.join(__dirname, 'videos'))) {
    fs.mkdirSync(path.join(__dirname, 'videos'));
}
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.post('/upload', upload.single('video'), (req, res) => {
    const filePath = path.join(__dirname, req.file.path);
    console.log(`File uploaded to: ${filePath}`);
    res.send({ path: filePath });
});

app.post('/trim', (req, res) => {
    const { videoPath, startTime, duration } = req.body;

    if (!videoPath || !fs.existsSync(videoPath)) {
        return res.status(400).send({ error: 'Invalid video path' });
    }

    const absoluteVideoPath = path.resolve(videoPath);
    const outputPath = path.join(__dirname, `videos/trimmed_${Date.now()}.mp4`);

    console.log(`Trimming video at: ${absoluteVideoPath}`);
    console.log(`Saving trimmed video to: ${outputPath}`);

    ffmpeg(absoluteVideoPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(outputPath)
        .on('end', () => {
            console.log(`Trimmed video saved to: ${outputPath}`);
            res.send({ success: true, outputPath });
        })
        .on('error', (err) => {
            console.error(`Error trimming video: ${err.message}`);
            res.status(500).send({ error: 'Error trimming video', message: err.message });
        })
        .run();
});

app.post('/merge', (req, res) => {
    const { videoPaths } = req.body;

    if (!videoPaths || !Array.isArray(videoPaths) || videoPaths.length < 2) {
        return res.status(400).send({ error: 'Invalid video paths' });
    }

    for (const videoPath of videoPaths) {
        if (!fs.existsSync(videoPath)) {
            return res.status(400).send({ error: `Invalid video path: ${videoPath}` });
        }
    }

    const outputPath = path.join(__dirname, `videos/merged_${Date.now()}.mp4`);
    const mergedVideo = ffmpeg();

    videoPaths.forEach(videoPath => {
        mergedVideo.input(path.resolve(videoPath));
    });

    console.log(`Merging videos: ${videoPaths.join(', ')}`);
    console.log(`Saving merged video to: ${outputPath}`);

    mergedVideo
        .on('end', () => {
            console.log(`Merged video saved to: ${outputPath}`);
            res.send({ success: true, outputPath });
        })
        .on('error', (err) => {
            console.error(`Error merging videos: ${err.message}`);
            res.status(500).send({ error: 'Error merging videos', message: err.message });
        })
        .mergeToFile(outputPath, path.join(__dirname, 'temp'));
});

const crypto = require('crypto');

const tokens = new Map();



app.get('/stream', (req, res) => {
    const { videoPath, token } = req.query;

    // Validate the token
    if (token) {
        const tokenData = tokens.get(token);
        if (tokenData && Date.now() - tokenData.timestamp < 1 * 60 * 1000) { // Valid for 1 minute
            // Token is valid
        } else {
            return res.status(403).send({ error: 'Token expired or invalid' });
        }
    } else {
        return res.status(400).send({ error: 'Token is required' });
    }

    if (!videoPath || !fs.existsSync(videoPath)) {
        return res.status(400).send({ error: 'Invalid video path' });
    }

    const absoluteVideoPath = path.resolve(videoPath);
    const stats = fs.statSync(absoluteVideoPath);
    const fileSize = stats.size;

    // Set headers for video streaming
    res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Content-Length': Math.min(fileSize, 1 * 1024 * 1024), // Limit to 1 MB (5 seconds of data)
        'Accept-Ranges': 'bytes',
    });

    const readStream = fs.createReadStream(absoluteVideoPath, { start: 0, end: Math.min(fileSize, 1 * 1024 * 1024) - 1 });

    // Pause the stream after 1 minute or when the token expires
    const pauseStream = setTimeout(() => {
        readStream.destroy(); // Stop the stream
        res.end(); // Close the response
    }, 1 * 60 * 1000); // 1 minute

    readStream.pipe(res);

    readStream.on('error', (err) => {
        console.error(`Error streaming video: ${err.message}`);
        clearTimeout(pauseStream); // Clear timeout on error
        res.status(500).send({ error: 'Error streaming video', message: err.message });
    });

    // Cleanup when response ends
    res.on('finish', () => {
        clearTimeout(pauseStream);
    });
});

app.get('/generate-token', (req, res) => {
    const token = crypto.randomBytes(16).toString('hex');
    tokens.set(token, { timestamp: Date.now() });

    res.send({ token });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));