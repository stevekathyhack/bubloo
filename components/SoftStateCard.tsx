export function SoftStateCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section className="surface-card surface-card--soft card-padding">
      <h2 className="card-title">{title}</h2>
      <p className="card-text">{body}</p>
    </section>
  );
}
