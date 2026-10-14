export function OfficeQrMark({
  image,
  officeName,
}: {
  image: string | null
  officeName: string
}) {
  return (
    <div className="mx-auto flex size-64 items-center justify-center rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(16,24,40,0.06)] sm:size-72 print:size-80">
      {image ? (
        <div className="relative size-full">
          {/* next/image cannot optimise a data URI generated in the browser. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={`Attendance QR code for ${officeName}`}
            className="size-full"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm sm:size-16">
              <NyscMark />
            </span>
          </span>
        </div>
      ) : (
        <div className="size-full animate-pulse rounded-2xl bg-surface-50" />
      )}
    </div>
  )
}

function NyscMark() {
  return (
    <svg viewBox="0 0 40 40" className="size-10" aria-hidden="true">
      <path
        d="M11.2 5.2h17.6c1.7 0 3.2.9 4.1 2.3l5.5 9.5c.8 1.4.8 3.2 0 4.6l-5.5 9.5c-.9 1.4-2.4 2.3-4.1 2.3H11.2c-1.7 0-3.2-.9-4.1-2.3l-5.5-9.5c-.8-1.4-.8-3.2 0-4.6l5.5-9.5c.9-1.4 2.4-2.3 4.1-2.3Z"
        fill="#148a47"
      />
      <path
        d="M20 11.2c-2.3 0-4.1 1.8-4.1 4.1 0 2.2 1.8 4 4.1 4s4.1-1.8 4.1-4-1.8-4.1-4.1-4.1Zm0 9.6c-3.4 0-6.4 1.8-8 4.5-.3.6.1 1.3.7 1.3h14.6c.6 0 1-.7.7-1.3-1.6-2.7-4.6-4.5-8-4.5Z"
        fill="white"
      />
    </svg>
  )
}
