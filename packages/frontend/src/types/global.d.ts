import { SetupWorkerApi } from 'msw';

declare global {
  interface Window {
    _msw?: SetupWorkerApi;
  }
}
