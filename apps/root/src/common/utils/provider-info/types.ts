export interface IAbstractConnectorOptions {
  network: string;
}

export type RequiredOption = string | string[];

export interface IProviderPackageOptions {
  required?: RequiredOption[];
}

export interface IProviderDisplay {
  name: string;
  logo: string;
  description?: string;
}

export interface IProviderInfo extends IProviderDisplay {
  id: string;
  type: string;
  check: string;
  package?: IProviderPackageOptions;
}
