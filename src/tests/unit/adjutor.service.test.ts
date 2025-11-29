// axios is mocked via jest.mock

jest.mock('axios');

describe('AdjutorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isBlacklisted', () => {
    it('should skip check when API key is not configured', async () => {
      // When API key is not configured, it should return false (skip check)
      const { AdjutorService } = require('../../services/adjutor.service');
      const adjutorService = new AdjutorService();
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = await adjutorService.isBlacklisted('test@example.com');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Adjutor API key not configured. Skipping karma check.');
      consoleSpy.mockRestore();
    });
  });

  describe('checkIdentities', () => {
    it('should return false when API key is not configured', async () => {
      const { AdjutorService } = require('../../services/adjutor.service');
      const adjutorService = new AdjutorService();
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = await adjutorService.checkIdentities('test@example.com', '+2348012345678');
      
      // When API key is not configured, both checks return false
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('Adjutor API Integration Logic', () => {
    it('should check that blacklist check returns boolean', async () => {
      const { AdjutorService } = require('../../services/adjutor.service');
      const adjutorService = new AdjutorService();
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = await adjutorService.isBlacklisted('test@example.com');
      
      expect(typeof result).toBe('boolean');
      consoleSpy.mockRestore();
    });

    it('should verify service has isBlacklisted method', () => {
      const { AdjutorService } = require('../../services/adjutor.service');
      const adjutorService = new AdjutorService();
      
      expect(typeof adjutorService.isBlacklisted).toBe('function');
    });

    it('should verify service has checkIdentities method', () => {
      const { AdjutorService } = require('../../services/adjutor.service');
      const adjutorService = new AdjutorService();
      
      expect(typeof adjutorService.checkIdentities).toBe('function');
    });
  });
});
