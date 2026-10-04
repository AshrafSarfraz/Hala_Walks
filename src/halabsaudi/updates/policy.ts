export type UpdatePolicy = {
  minimumBuild: number;
  latestVersion: string;
  storeUrl: string;
  message?: string;
};
/** Invalid/incomplete configuration cannot lock users out or redirect them elsewhere. */
export function parseUpdatePolicy(
  data: unknown,
  platform: string,
): UpdatePolicy | null {
  if (!data || typeof data !== 'object' || (data as any).enabled !== true) {
    return null;
  }
  const policy = (data as any)[platform];
  if (
    !policy ||
    !Number.isSafeInteger(policy.minimumBuild) ||
    policy.minimumBuild < 1
  ) {
    return null;
  }
  if (
    typeof policy.latestVersion !== 'string' ||
    !policy.latestVersion.trim()
  ) {
    return null;
  }
  if (typeof policy.storeUrl !== 'string') {
    return null;
  }
  const validUrl =
    platform === 'android'
      ? /^https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.halabsaudiappreactnativeversion(?:&[^\s]*)?$/.test(
          policy.storeUrl,
        )
      : platform === 'ios' &&
        /^https:\/\/apps\.apple\.com\/(?:[a-z]{2}\/)?app\/[^\s?#]+\/id\d+(?:\?[^\s]*)?$/.test(
          policy.storeUrl,
        );
  if (!validUrl) {
    return null;
  }
  return {
    minimumBuild: policy.minimumBuild,
    latestVersion: policy.latestVersion.trim(),
    storeUrl: policy.storeUrl,
    message: typeof policy.message === 'string' ? policy.message : undefined,
  };
}
export function needsUpdate(
  buildNumber: string,
  policy: UpdatePolicy | null,
): boolean {
  return (
    !!policy &&
    /^\d+$/.test(buildNumber) &&
    Number(buildNumber) < policy.minimumBuild
  );
}
