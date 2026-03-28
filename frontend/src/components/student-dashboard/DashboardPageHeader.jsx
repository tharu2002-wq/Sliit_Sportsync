export function DashboardPageHeader({ title, description }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">{title}</h1>
      {description ? <p className="mt-1.5 max-w-2xl text-sm text-gray-500">{description}</p> : null}
    </header>
  );
}
