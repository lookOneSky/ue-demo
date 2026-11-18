
function createGuid() {
  const timestamp = new Date().getTime().toString(16);
  const randomPart = Math.floor(Math.random() * 0xFFFFFFFF).toString(16);
  return `${timestamp.padStart(12, '0')}-${randomPart.padStart(8, '0')}-${Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, '0')}-${Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, '0')}`;
}
export default createGuid;
