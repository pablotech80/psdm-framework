export const PRODUCT_NAME = 'Riscala'
export const PRODUCT_DESCRIPTOR = 'AI Code Governance for Software Delivery'
export const METHOD_NAME = 'PSDM'
export const PRIMARY_EXECUTABLE = 'riscala'
export const COMPATIBILITY_EXECUTABLE = 'psdm'

export function productHeader() {
  return `${PRODUCT_NAME}\n${PRODUCT_DESCRIPTOR}\nPowered by ${METHOD_NAME}`
}
