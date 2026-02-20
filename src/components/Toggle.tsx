export default function Toggle() {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" defaultChecked className="peer sr-only" />
      <div className="dark:bg-border-dark relative h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-emerald-500 after:absolute after:top-1 after:left-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
    </label>
  );
}
