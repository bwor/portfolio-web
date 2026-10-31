interface ArrowProps {
  diagonal?: boolean
}

export function Arrow({ diagonal = false }: ArrowProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" width="16" height="16">
      {diagonal ? (
        <path
          d="M4 12 12 4m0 0H5m7 0v7"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M2.5 8h11m-4-4 4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
