export default function PanelHeader({ code, title, tag, tagTone = "" }) {
  return (
    <div className="ph">
      <span className="ph-code mono">{code}</span>
      <span className="ph-title">{title}</span>
      {tag && <span className={`ph-tag ${tagTone}`}>{tag}</span>}
    </div>
  );
}
