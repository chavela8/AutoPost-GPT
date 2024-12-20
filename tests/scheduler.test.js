const { describe, test, expect, beforeEach, jest } = require('@jest/globals');
const { schedulePost } = require('../src/services/scheduler');
const { models } = require('../src/db');
const schedule = require('node-schedule');
const { publishPost } = require('../src/services/publisher');

jest.mock('../src/db');
jest.mock('node-schedule');
jest.mock('../src/services/publisher');

describe('Post Scheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Post Scheduling', () => {
    test('should schedule post successfully', async () => {
      const mockPost = {
        id: 1,
        save: jest.fn()
      };

      models.Post.findByPk = jest.fn().mockResolvedValue(mockPost);
      models.Channel.findOne = jest.fn().mockResolvedValue({ id: 1 });
      models.Schedule.findOne = jest.fn().mockResolvedValue({
        activeHoursStart: 9,
        activeHoursEnd: 21
      });

      schedule.scheduleJob = jest.fn();

      await schedulePost(1);
      expect(mockPost.save).toHaveBeenCalled();
      expect(schedule.scheduleJob).toHaveBeenCalled();
    });

    test('should handle missing post', async () => {
      models.Post.findByPk = jest.fn().mockResolvedValue(null);
      await expect(schedulePost(999)).rejects.toThrow();
    });

    test('should handle missing channel', async () => {
      const mockPost = { id: 1 };
      models.Post.findByPk = jest.fn().mockResolvedValue(mockPost);
      models.Channel.findOne = jest.fn().mockResolvedValue(null);

      await expect(schedulePost(1)).rejects.toThrow();
    });

    test('should handle missing schedule', async () => {
      const mockPost = { id: 1 };
      models.Post.findByPk = jest.fn().mockResolvedValue(mockPost);
      models.Channel.findOne = jest.fn().mockResolvedValue({ id: 1 });
      models.Schedule.findOne = jest.fn().mockResolvedValue(null);

      await expect(schedulePost(1)).rejects.toThrow();
    });
  });

  describe('Time Slot Calculation', () => {
    test('should calculate next slot within working hours', async () => {
      const mockPost = { id: 1, save: jest.fn() };
      const mockSchedule = {
        activeHoursStart: 9,
        activeHoursEnd: 21
      };

      models.Post.findByPk = jest.fn().mockResolvedValue(mockPost);
      models.Channel.findOne = jest.fn().mockResolvedValue({ id: 1 });
      models.Schedule.findOne = jest.fn().mockResolvedValue(mockSchedule);

      await schedulePost(1);
      const savedDate = mockPost.save.mock.calls[0][0].scheduledFor;
      
      expect(savedDate.getHours()).toBeGreaterThanOrEqual(mockSchedule.activeHoursStart);
      expect(savedDate.getHours()).toBeLessThan(mockSchedule.activeHoursEnd);
    });

    test('should schedule for next day if current time is after end hours', async () => {
      const mockPost = { id: 1, save: jest.fn() };
      const mockSchedule = {
        activeHoursStart: 9,
        activeHoursEnd: 21
      };

      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(22);

      models.Post.findByPk = jest.fn().mockResolvedValue(mockPost);
      models.Channel.findOne = jest.fn().mockResolvedValue({ id: 1 });
      models.Schedule.findOne = jest.fn().mockResolvedValue(mockSchedule);

      await schedulePost(1);
      const savedDate = mockPost.save.mock.calls[0][0].scheduledFor;
      
      expect(savedDate.getDate()).toBe(new Date().getDate() + 1);
      expect(savedDate.getHours()).toBe(mockSchedule.activeHoursStart);
    });

    // Добавлен новый тест
    test('should respect minimum interval between posts', async () => {
      const mockPost1 = { id: 1, save: jest.fn() };
      const mockPost2 = { id: 2, save: jest.fn() };
      const mockSchedule = {
        activeHoursStart: 9,
        activeHoursEnd: 21,
        minInterval: 60 // минут
      };

      models.Post.findByPk.mockResolvedValueOnce(mockPost1)
        .mockResolvedValueOnce(mockPost2);
      models.Channel.findOne.mockResolvedValue({ id: 1 });
      models.Schedule.findOne.mockResolvedValue(mockSchedule);

      await schedulePost(1);
      await schedulePost(2);

      const time1 = mockPost1.save.mock.calls[0][0].scheduledFor;
      const time2 = mockPost2.save.mock.calls[0][0].scheduledFor;
      
      const diffInMinutes = (time2 - time1) / (1000 * 60);
      expect(diffInMinutes).toBeGreaterThanOrEqual(mockSchedule.minInterval);
    });
  });

  describe('Publishing Integration', () => {
    test('should call publisher when scheduled time arrives', async () => {
      const mockPost = { id: 1, save: jest.fn() };
      
      models.Post.findByPk = jest.fn().mockResolvedValue(mockPost);
      models.Channel.findOne = jest.fn().mockResolvedValue({ id: 1 });
      models.Schedule.findOne = jest.fn().mockResolvedValue({
        activeHoursStart: 9,
        activeHoursEnd: 21
      });

      schedule.scheduleJob = jest.fn().mockImplementation((date, callback) => callback());

      await schedulePost(1);
      expect(publishPost).toHaveBeenCalledWith(1);
    });

    test('should handle publishing errors', async () => {
      const mockPost = { id: 1, save: jest.fn() };
      
      models.Post.findByPk = jest.fn().mockResolvedValue(mockPost);
      models.Channel.findOne = jest.fn().mockResolvedValue({ id: 1 });
      models.Schedule.findOne = jest.fn().mockResolvedValue({
        activeHoursStart: 9,
        activeHoursEnd: 21
      });

      publishPost.mockRejectedValueOnce(new Error('Publishing failed'));
      schedule.scheduleJob = jest.fn().mockImplementation((date, callback) => callback());

      await schedulePost(1);
      expect(mockPost.save).toHaveBeenCalled();
    });
  });
});