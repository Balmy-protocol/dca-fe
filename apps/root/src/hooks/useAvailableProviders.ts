import useServiceEvents from './useServiceEvents';
import useWalletClientService from './useWalletClientService';
import WalletClientsService, { WalletClientsServiceData } from '@services/walletClientsService';

function useAvailableProviders() {
  const walletClientService = useWalletClientService();

  const availableProviders = useServiceEvents<WalletClientsServiceData, WalletClientsService, 'getAvailableProviders'>(
    walletClientService,
    'getAvailableProviders'
  );

  return availableProviders;
}

export default useAvailableProviders;
