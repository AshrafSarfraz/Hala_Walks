export type Checkin = {_id: string; image: string; caption?: string; createdAt?: string;
  location?: {_id?: string; name?: string} | null};
export type PlaceAlbum = {key: string; name: string; posts: Checkin[]};

export function placeKey(post: Checkin): string {
  const name = (post.location?.name || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
  // Unknown locations must not all collapse into one unrelated album.
  return name && !['unknown', 'current location'].includes(name)
    ? `name:${name}` : `id:${post.location?._id || post._id}`;
}

export function groupPlaceAlbums(posts: Checkin[]): PlaceAlbum[] {
  const albums = new Map<string, PlaceAlbum>();
  for (const post of posts) {
    const key = placeKey(post);
    if (!albums.has(key)) albums.set(key, {key, name: (post.location?.name || '').trim().replace(/\s+/g, ' ') || 'Place', posts: []});
    albums.get(key)!.posts.push(post);
  }
  return [...albums.values()];
}
