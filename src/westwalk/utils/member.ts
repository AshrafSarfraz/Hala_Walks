export function memberName(member: any): string {
  const candidates = [
    member?.name,
    member?.Name,
    member?.fullName,
    member?.displayName,
  ];
  return (
    candidates
      .find(value => typeof value === 'string' && value.trim())
      ?.trim() || ''
  );
}
export function memberInitials(name: string): string {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return parts.length
    ? (
        parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')
      ).toUpperCase()
    : '?';
}
export function memberPhoto(member: any): string {
  return (
    [member?.profileImg, member?.profileImage, member?.photoURL]
      .find(
        v =>
          typeof v === 'string' &&
          /^(https?:\/\/|file:\/\/|content:\/\/)/i.test(v.trim()),
      )
      ?.trim() || ''
  );
}
