export default function (res) {
  console.log('res in log Billing?', res)
  console.log('res in log billing args:', arguments)
  console.log('this in log billing?', this)
  // const header = res.responseHeaders
  // const cost = Number(header['x-points-total']) * .00001
  // const billingPoints = {
  //   'pts_network_in': Number(header['x-points-network-in']),
  //   'pts_network_out': Number(header['x-points-network-out']),
  //   'pts_storage_read': Number(header['x-points-storage-read']),
  //   'pts_storage_write': Number(header['x-points-storage-write']),
  //   'pts_total': Number(header['x-points-total']),
  //   'cost_total': cost,
  //   'cost_10k': cost * 10000,
  //   'cost_100k': cost * 100000,
  //   'cost_1mil': cost * 1000000
  // }

  // // console.log('logBilling res:\n', res)

  // if (res.responseContent) {
  //   if (typeof res.responseContent.resource !== 'object') {
  //     return res.responseContent.resource = {
  //       billing: billingPoints,
  //       data: res.responseContent.resource
  //     }
  //   } else {
  //     return res.responseContent.resource.billing = billingPoints
  //   }  
  // }
}