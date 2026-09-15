import type { ResolvedPack } from '../packs/resolve'
import { capabilitiesAgree, declaredExecute, executableFingerprint, isBundledUnmodified } from '../packs/fingerprint'
import { hasTrust, revokeTrust } from '../settings/store'

export function assertCanSpawn(pack: ResolvedPack): void {
  const execute = declaredExecute(pack)
  if (execute === 'none') {
    throw Object.assign(new Error('This pack cannot run code'), { code: 'sandbox' })
  }
  const agree = capabilitiesAgree(pack)
  if (!agree.ok) {
    throw Object.assign(new Error(agree.message ?? 'capabilities mismatch'), { code: 'pack-invalid' })
  }
  const fp = executableFingerprint(pack)
  if (isBundledUnmodified(pack)) return
  if (hasTrust(pack.packId, fp)) return
  revokeTrust(pack.packId)
  throw Object.assign(new Error('Trust this pack fingerprint before running code'), { code: 'sandbox' })
}
