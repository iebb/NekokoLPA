export const makeLoading = (setLoading: (v: boolean) => void, exec: () => Promise<void>) => {
  setLoading(true);
  setTimeout(() => {
    exec().then(() => setLoading(false));
  }, 100);
};
