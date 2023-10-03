import { IAbstractConnectorOptions } from '../../types';

export interface IVenlyConnectorOptions extends IAbstractConnectorOptions {
  clientId: string;
  secretType?: string;
  environment?: string;
  authenticationOptions?: {
    idpHint?: string;
  };
}

const ConnectToVenly = (Venly: any, opts: IVenlyConnectorOptions) => {
  return new Promise(async (resolve, reject) => {
    if (opts && opts.clientId) {
      try {
        const options = {
          clientId: opts.clientId,
          secretType: opts.secretType || 'ETHEREUM',
          environment: opts.environment,
          authenticationOptions: opts.authenticationOptions,
          signMethod: 'POPUP',
        };
        const provider = await (window as any).Venly.createProviderEngine(options);
        return resolve(provider);
      } catch (error) {
        console.error(error);
        return reject(new Error('Failed to login to Venly'));
      }
    } else {
      return reject(new Error('Please provide an Venly client id'));
    }
  });
};

export default ConnectToVenly;
