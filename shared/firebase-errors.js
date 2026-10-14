export function isPermissionDenied(error) {
  const code=String(error?.code||'').toLowerCase().replace(/_/g,'-');
  const message=String(typeof error==='string'?error:error?.message||'').toLowerCase();
  return code.includes('permission-denied') || /permission[\s_-]+denied/.test(message);
}
export function errorCode(error) {
  const code=String(error?.code||'').toLowerCase();
  return /^[a-z0-9_/-]{1,100}$/.test(code)?code:'';
}
