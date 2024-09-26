export const makeLoading = (setLoading: (v: boolean) => void, exec: () => void) => {
  setLoading(true);
  setTimeout(() => {
    exec();
    setLoading(false);
  }, 100);
}