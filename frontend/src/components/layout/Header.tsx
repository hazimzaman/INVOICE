import LogoutButton from '../ui/LogoutButton';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Your logo or brand name */}
          </div>
          <div className="flex items-center gap-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}