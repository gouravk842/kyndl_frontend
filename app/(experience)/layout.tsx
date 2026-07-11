/**
 * Immersive experience shell.
 *
 * Unlike `(marketing)`, this route group renders no header, footer, or page
 * chrome — just the experience, full-bleed. It exists so pieces like the
 * Constellation can own the entire viewport as a dark canvas. Inherits the root
 * layout's `<html>`/`<body>`, providers, and fonts; it only paints the void
 * behind the experience so there's no flash of the warm marketing cream.
 */
export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#020818]">{children}</div>
  );
}
