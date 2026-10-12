/** The backend only stores city + address, so the province is worked out from that text. */
const WESTERN = ['colombo', 'gampaha', 'negombo', 'kalutara', 'dehiwala', 'mount lavinia', 'nugegoda', 'maharagama', 'kotte', 'moratuwa', 'wattala', 'ja-ela', 'panadura', 'kandana', 'rajagiriya', 'borella', 'ragama', 'kelaniya', 'horana', 'homagama', 'piliyandala']
const CENTRAL = ['kandy', 'peradeniya', 'matale', 'nuwara eliya', 'gampola', 'katugastota', 'dambulla']

export const PROVINCE_ORDER = ['Western Province', 'Central Province', 'Other provinces']

export function provinceOf(h) {
  const t = `${h.city || ''} ${h.address || ''} ${h.name || ''}`.toLowerCase()
  if (WESTERN.some((w) => t.includes(w))) return 'Western Province'
  if (CENTRAL.some((w) => t.includes(w))) return 'Central Province'
  return 'Other provinces'
}