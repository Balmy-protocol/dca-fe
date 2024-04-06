import { setupCache, setup } from 'axios-cache-adapter';
import axios from 'axios';

// this should not be here
// Create `axios-cache-adapter` instance
const cache = setupCache({
  maxAge: 15 * 60 * 1000,
});

// Create `axios` instance passing the newly created `cache.adapter`
export const axiosClient = axios.create({
  adapter: cache.adapter,
});

export const setupAxiosClient = () =>
  setup({
    cache: {
      maxAge: 15 * 60 * 1000,
      exclude: {
        query: false,
        methods: ['put', 'patch', 'delete'],
        paths: [/.*accounts$/],
      },
    },
  });
