import { buildUploadRelativePath, toSaveMediaContext } from './build-upload-path';
import { ENTITY_TYPE } from '../constant';

describe('buildUploadRelativePath', () => {
  it('builds property path', () => {
    expect(
      buildUploadRelativePath(
        toSaveMediaContext(ENTITY_TYPE.PROPERTY, 12),
        'photo.jpg',
      ),
    ).toBe('uploads/12/property/photo.jpg');
  });

  it('builds room path', () => {
    expect(
      buildUploadRelativePath(
        toSaveMediaContext(ENTITY_TYPE.ROOM, 5, 3),
        'photo.jpg',
      ),
    ).toBe('uploads/3/room/5/photo.jpg');
  });

  it('builds user avatar path', () => {
    expect(
      buildUploadRelativePath(
        toSaveMediaContext(ENTITY_TYPE.USER, 7),
        'avatar.jpg',
      ),
    ).toBe('uploads/users/7/avatar/avatar.jpg');
  });
});
