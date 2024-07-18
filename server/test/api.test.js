const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { app } = require('../index');

jest.mock('fluent-ffmpeg');
const ffmpeg = require('fluent-ffmpeg');

describe('API Endpoints', () => {
  let server;
  
  beforeAll((done) => {
    server = app.listen(0, () => {
      console.log(`Test server running on port ${server.address().port}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /upload', () => {
    it('should upload a video file', async () => {
      const response = await request(server)
        .post('/upload')
        .attach('video', path.join(__dirname, 'test-video.mp4'));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('path');
      expect(response.body.path).toContain('uploads');
    });

    it('should return 400 if no file is uploaded', async () => {
      const response = await request(server)
        .post('/upload');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /trim', () => {
    it('should trim a video', async () => {
      const mockVideoPath = path.join(__dirname, 'test-video.mp4');
      
      // Mock ffmpeg
      ffmpeg.mockReturnValue({
        setStartTime: jest.fn().mockReturnThis(),
        setDuration: jest.fn().mockReturnThis(),
        output: jest.fn().mockReturnThis(),
        on: jest.fn().mockImplementation(function(event, callback) {
          if (event === 'end') {
            callback();
          }
          return this;
        }),
        run: jest.fn()
      });

      const response = await request(server)
        .post('/trim')
        .send({
          videoPath: mockVideoPath,
          startTime: '00:00:01',
          duration: '00:00:10'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('outputPath');
    });

    it('should return 400 if video path is invalid', async () => {
      const response = await request(server)
        .post('/trim')
        .send({
          videoPath: 'invalid/path',
          startTime: '00:00:01',
          duration: '00:00:10'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /merge', () => {
    it('should merge multiple videos', async () => {
      const mockVideoPaths = [
        path.join(__dirname, 'test-video1.mp4'),
        path.join(__dirname, 'test-video2.mp4')
      ];

      // Mock ffmpeg
      ffmpeg.mockReturnValue({
        input: jest.fn().mockReturnThis(),
        inputOptions: jest.fn().mockReturnThis(),
        outputOptions: jest.fn().mockReturnThis(),
        output: jest.fn().mockReturnThis(),
        on: jest.fn().mockImplementation(function(event, callback) {
          if (event === 'end') {
            callback();
          }
          return this;
        }),
        run: jest.fn()
      });

      const response = await request(server)
        .post('/merge')
        .send({
          videoPaths: mockVideoPaths
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('outputPath');
    });

    it('should return 400 if less than 2 video paths are provided', async () => {
      const response = await request(server)
        .post('/merge')
        .send({
          videoPaths: [path.join(__dirname, 'test-video1.mp4')]
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 if any video path is invalid', async () => {
      const response = await request(server)
        .post('/merge')
        .send({
          videoPaths: [
            path.join(__dirname, 'test-video1.mp4'),
            'invalid/path'
          ]
        });

      expect(response.status).toBe(400);
    });
  });
});