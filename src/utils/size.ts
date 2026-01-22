import { preferences, sizeStats } from "@/utils/mmkv";
import { isSimplifiedMode } from "@/utils/featureConfig";
import sizeFile, { ProfileSizes } from "@/data/sizes";

const numberFormat = Intl.NumberFormat();

interface ProfileMetadata {
  iccid?: string;
  profileOwnerMccMnc?: string;
  serviceProviderName?: string;
}

export const getExactProfileSize = (iccid: string): number => {
  const exactSize = sizeStats.getNumber(iccid) || 0;
  // If exact size is valid (between 5KB and 200KB), use it
  if (exactSize >= 5 * 1024 && exactSize <= 200 * 1024) {
    return exactSize;
  }
  return 0;
}

export const getEstimatedProfileSize = (profile: ProfileMetadata, eid: string = ""): number => {
  const exactSize = getExactProfileSize(profile.iccid || "");
  if (exactSize > 0) return exactSize;

  // Calculate generic overhead/delta based on EID
  const sizeDelta = (sizeFile as ProfileSizes).offset[eid.substring(0, 8)] ?? 0;

  // Try to find predicted size from database
  const profileTag = `${profile.profileOwnerMccMnc}|${profile.serviceProviderName}`;
  const sizeValue = (sizeFile as ProfileSizes).sizes[profileTag] ?? null;

  if (sizeValue && sizeValue.length > 0) {
    // Use average of predicted sizes + delta
    const avgSize = sizeValue.reduce((a, b) => a + b, 0) / sizeValue.length;
    console.log("Profile tag: " + profileTag);
    console.log("Average size: " + avgSize);
    console.log("Size delta: " + sizeDelta);
    return avgSize + sizeDelta;
  }

  // Default fallback: 40KB + delta
  return (33 * 1024) + sizeDelta;
};

export const formatSize = (bytes: number = 0): string => {
  const sizeUnit = isSimplifiedMode() ? "adaptive_si" : (preferences.getString("unit") ?? "b");
  switch (sizeUnit) {
    case "b":
      return `${numberFormat.format(bytes)} B`;
    case "kb":
      return `${numberFormat.format(bytes / 1000)} kB`;
    case "mb":
      return `${numberFormat.format(bytes / 1000000)} MB`;
    case "kib":
      return `${numberFormat.format(bytes / 1024)} kiB`;
    case "mib":
      return `${numberFormat.format(bytes / 1048576)} MiB`;
    case "adaptive_si":
      if (bytes <= 1.5 * 1000) {
        return `${numberFormat.format(bytes)} B`;
      }
      if (bytes <= 1.5 * 1000000) {
        return `${numberFormat.format(bytes / 1000)} kB`;
      }
      return `${numberFormat.format(bytes / 1000000)} MB`;
    case "adaptive_bi":
      if (bytes <= 1.5 * 1024) {
        return `${numberFormat.format(bytes)} B`;
      }
      if (bytes <= 1.5 * 1048576) {
        return `${numberFormat.format(bytes / 1024)} kiB`;
      }
      return `${numberFormat.format(bytes / 1048576)} MiB`;
  }
  return `${numberFormat.format(bytes / 1000)} kB`;
}