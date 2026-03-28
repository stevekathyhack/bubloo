import { IconLightbulb, IconMoon } from "../icons";

export function HandoffSection({
  title,
  caption,
  items,
}: {
  title: string;
  caption?: string;
  items: string[];
}) {
  return (
    <section>
      <div className="section-header">
        <IconLightbulb className="section-header-icon" size={16} />
        <h2 className="section-header-title">{title}</h2>
      </div>
      {caption ? <p className="section-caption">{caption}</p> : null}
      <ul className="section-list">
        {items.map((item) => (
          <li key={item} className="section-list-item">
            <div className="section-list-icon">
              <IconMoon size={16} />
            </div>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
