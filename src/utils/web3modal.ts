import Web3Modal from 'web3modal';

async function setUpWeb3Modal() {
  const providerOptions = {
    /* See Provider Options Section */
  };

  const web3Modal = new Web3Modal({
    network: 'mainnet', // optional
    cacheProvider: true, // optional
    providerOptions, // required
  });

  // const provider = await web3Modal.connect();

  // const web3 = new Web3(provider);
  // web3Modal.toggleModal();
}
