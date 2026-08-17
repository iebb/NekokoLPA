// Browser stub for design-sync previews: the native clipboard bridge does not
// exist off-device. Previews are static, so the write is a no-op.
export default {
  setString: (_: string) => {},
  getString: async () => '',
};
