
export default function (res = {}) {
  
  const header = res.responseHeaders || {}

  if (!header || !header.hasOwnProperty('x-points-total')) {
    console.log('logBilling error - points data not available. res:\n', res)  
  }

  if (!res.responseContent) {
    console.log('logBilling error - no responseContent. res:\n', res)
  }

  const cost = Number(header['x-points-total']) * .00001

  const billingPoints = {
    'pts_network_in': Number(header['x-points-network-in']),
    'pts_network_out': Number(header['x-points-network-out']),
    'pts_storage_read': Number(header['x-points-storage-read']),
    'pts_storage_write': Number(header['x-points-storage-write']),
    'pts_total': Number(header['x-points-total']),
    'cost_total': cost,
    'cost_10k': cost * 10000,
    'cost_100k': cost * 100000,
    'cost_1mil': cost * 1000000
  }
  
  // resource is typically an object, but not always. checks if object, then not null/undefined, then not a date
  if (typeof res.responseContent.resource === 'object' && res.responseContent.resource && Object.keys(res.responseContent.resource).length > 0) {
    Object.assign(res.responseContent.resource, { billing: billingPoints })
  } else {
    res.responseContent.resource = {
      data: res.responseContent.resource,
      billing: billingPoints
    }
  }
  return
}