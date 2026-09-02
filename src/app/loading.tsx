export default function Loading() {
  return (
    <main
      className="page-shell inner-page"
      aria-busy="true"
      aria-label="加载中"
    >
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-copy" />
      <div className="skeleton-grid">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="skeleton skeleton-card" key={index} />
        ))}
      </div>
    </main>
  );
}
