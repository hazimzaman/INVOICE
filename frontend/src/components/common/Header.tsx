import { getFirstName } from '@/utils/nameFormat';

// ... other imports ...

export default function Header() {
  const { data: session } = useSession();
  
  return (
    <header className="...">
      {/* ... other header content ... */}
      
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">
          {getFirstName(session?.user?.name)}
        </span>
        {/* ... rest of the header ... */}
      </div>
    </header>
  );
} 