import chai from 'chai';
import chaiHttp from 'chai-http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const expect = chai.expect;

chai.use(chaiHttp);

const SERVER_URL = 'http://localhost:5000';

describe('Video Processing API', function() {
  this.timeout(30000); // Increase timeout for video processing

  let uploadedVideoPath;

  before(function() {
    // Create test video files if they don't exist
    const testVideoPath = path.join(__dirname, 'test_video.mp4');
    if (!fs.existsSync(testVideoPath)) {
      // Create a dummy video file for testing
      fs.writeFileSync(testVideoPath, 'Dummy video content');
    }
  });

  it('should upload a video file', (done) => {
    chai.request(SERVER_URL)
      .post('/upload')
      .attach('video', fs.readFileSync(path.join(__dirname, 'test_video.mp4')), 'test_video.mp4')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('path');
        expect(res.body.path).to.be.a('string');
        uploadedVideoPath = res.body.path;
        done();
      });
  });

  it('should trim a video', (done) => {
    chai.request(SERVER_URL)
      .post('/trim')
      .send({
        videoPath: uploadedVideoPath,
        startTime: '00:00:00',
        duration: '00:00:05'
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('success', true);
        expect(res.body).to.have.property('outputPath');
        done();
      });
  });

  it('should merge videos', (done) => {
    // For this test, we'll use the same video twice
    chai.request(SERVER_URL)
      .post('/merge')
      .send({
        videoPaths: [uploadedVideoPath, uploadedVideoPath]
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('success', true);
        expect(res.body).to.have.property('outputPath');
        done();
      });
  });

  it('should return an error for invalid video path during trim', (done) => {
    chai.request(SERVER_URL)
      .post('/trim')
      .send({
        videoPath: '/invalid/path.mp4',
        startTime: '00:00:00',
        duration: '00:00:05'
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error', 'Invalid video path');
        done();
      });
  });

  it('should return an error for invalid video paths during merge', (done) => {
    chai.request(SERVER_URL)
      .post('/merge')
      .send({
        videoPaths: ['/invalid/path1.mp4', '/invalid/path2.mp4']
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error').that.includes('Invalid video path');
        done();
      });
  });

  after(function() {
    // Clean up: delete test files
    const testVideoPath = path.join(__dirname, 'test_video.mp4');
    if (fs.existsSync(testVideoPath)) {
      fs.unlinkSync(testVideoPath);
    }
    // You might want to add cleanup for uploaded and processed videos as well
  });
});