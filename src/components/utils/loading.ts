export const makeLoading = (setLoading: (v: boolean) => void, exec: () => Promise<void>) => {
  setLoading(true);
  setTimeout(() => {
    exec().then(p => setLoading(false))
  }, 100);
}