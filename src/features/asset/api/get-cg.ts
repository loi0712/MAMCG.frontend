import { apiUrls } from "@/api/config/endpoints";
import { axios } from "@/shared/lib/axios";

// TypeScript interfaces for API response
interface CgField {
  id: number;
  fieldName: string;
  dataType: string;
  displayName: string;
  value: string | null;
  color: string | null;
}

interface CgAsset {
  id: number;
  name: string;
  filePath: string;
  extension: string;
  size: number;
  isApproved: boolean;
  workflowItemId: number;
  fields: CgField[];
}

interface Scene {
  sceneName: string;
  scenePath: string;
  previewPath: string;
  variables: Record<string, string>;
}

export interface CgDetailResponse {
  asset: CgAsset;
  scenes: Scene[];
}

export const getCgDetail = async (assetId: string): Promise<CgDetailResponse> => {
  const { data } = await axios.get<CgDetailResponse>(
    apiUrls.asset.cg(assetId)
  );
  return data;
};
