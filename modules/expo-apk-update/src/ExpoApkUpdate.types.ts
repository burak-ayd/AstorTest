export type UpdateEventPayload = {
  status: string;
};

export type VersionInfo = {
  versionName: string;
  versionCode: number;
};

export type ReleaseAsset = {
  name: string;
  browser_download_url: string;
  size: number;
};

export type GitHubRelease = {
  tag_name: string;
  body: string;
  assets: ReleaseAsset[];
};
