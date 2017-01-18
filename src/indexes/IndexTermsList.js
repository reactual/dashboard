import React from 'react';

export default function IndexTermsList({terms}) {
  if (!terms) return null

  const details = terms.map((t, i) => {
    return (
      <dl key={i}>
        <dt>{JSON.stringify(t.field)}</dt>
        {t.transform && <dd>Transform: {t.transform}</dd>}
        {t.reverse && <dd>Reverse: {JSON.stringify(t.reverse)}</dd>}
      </dl>
    )
  })

  return <div>{details}</div>
}
