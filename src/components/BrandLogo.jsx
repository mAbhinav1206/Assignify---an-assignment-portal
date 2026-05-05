const BrandLogo = ({ compact = false }) => {
  return (
    <div className={`brandLogo ${compact ? "brandLogoCompact" : ""}`} aria-label="Assignify">
      <span className="brandMark" aria-hidden="true">
        <span className="brandSheet">
          <span className="brandLine brandLineLong" />
          <span className="brandLine brandLineMedium" />
          <span className="brandLine brandLineShort" />
        </span>
        <span className="brandCheck" />
      </span>

      <span className="brandWordmark">Assignify</span>
    </div>
  );
};

export default BrandLogo;
