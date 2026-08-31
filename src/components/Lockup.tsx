export function Lockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand${compact ? " compact" : ""}`}>
      <img src="/mark.png" alt="" />
      <span className="word">
        HAMZURY<span className="tld">.com</span>
      </span>
    </span>
  );
}
