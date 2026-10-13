import {directoryRows, fetchDirectory} from '../utils/directory';
import {memberInitials, memberName, memberPhoto} from '../utils/member';
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});
it('maps real HR fields and wrapped responses', () => {
  expect(
    directoryRows({
      data: [
        {_id: '1', Name: 'Ashraf Sarfraz', Title: 'Staff', MobilePhone: 123},
      ],
    }),
  ).toEqual([
    {id: '1', name: 'Ashraf Sarfraz', position: 'Staff', phone: '123'},
  ]);
  expect(() => directoryRows({message: 'error'})).toThrow();
});
it('bounds a stalled response body, not only fetch', async () => {
  jest.useFakeTimers();
  jest
    .spyOn(global, 'fetch')
    .mockResolvedValue({ok: true, json: () => new Promise(() => {})} as any);
  const result = expect(fetchDirectory(100)).rejects.toThrow('timed out');
  await Promise.resolve();
  jest.advanceTimersByTime(101);
  await result;
});
it('rejects server errors instead of treating them as empty contacts', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({ok: false} as any);
  await expect(fetchDirectory()).rejects.toThrow();
});
it('uses real names and initials when photos are absent or invalid', () => {
  expect(memberName({name: ' Ashraf Sarfraz '})).toBe('Ashraf Sarfraz');
  expect(memberInitials(' Ashraf Sarfraz ')).toBe('AS');
  expect(memberPhoto({profileImg: 'null'})).toBe('');
  expect(memberPhoto({profileImg: ' https://example.com/photo.png '})).toBe(
    'https://example.com/photo.png',
  );
});
