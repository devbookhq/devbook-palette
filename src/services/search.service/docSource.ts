import { APIVersion } from 'services/api.service';


export interface DocSource {
  slug: string;
  name: string;
  version: APIVersion;
  iconURL: string;
}
