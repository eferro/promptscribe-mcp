import { UserId } from './UserId';

describe('UserId', () => {
  describe('create', () => {
    it('should create valid user id with uuid', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const userId = UserId.create(validUuid);
      expect(userId.getValue()).toBe(validUuid);
    });

    it('should throw for invalid uuid format', () => {
      expect(() => UserId.create('invalid-uuid')).toThrow('Invalid user ID format');
      expect(() => UserId.create('')).toThrow('Invalid user ID format');
      expect(() => UserId.create('123')).toThrow('Invalid user ID format');
    });

    it('should accept various valid uuid formats', () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '00000000-0000-0000-0000-000000000000'
      ];

      validUuids.forEach(uuid => {
        expect(() => UserId.create(uuid)).not.toThrow();
        expect(UserId.create(uuid).getValue()).toBe(uuid);
      });
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const id1 = UserId.create(uuid);
      const id2 = UserId.create(uuid);
      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different values', () => {
      const id1 = UserId.create('123e4567-e89b-12d3-a456-426614174000');
      const id2 = UserId.create('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      expect(id1.equals(id2)).toBe(false);
    });
  });
});