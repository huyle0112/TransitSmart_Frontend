import { Button } from "@/components/ui/button";

const FILTERS = [
    { id: 'fastest', label: 'Nhanh nhất' },
    { id: 'fewest_transfers', label: 'Ít chuyển' },
    { id: 'cheapest', label: 'Rẻ nhất' },
];

interface FilterTabsProps {
    activeFilter: string;
    onChange: (filterId: string) => void;
}

export default function FilterTabs({ activeFilter, onChange }: FilterTabsProps) {
    return (
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
            {FILTERS.map((filter) => (
                <Button
                    key={filter.id}
                    type="button"
                    variant={activeFilter === filter.id ? "default" : "ghost"}
                    onClick={() => onChange(filter.id)}
                    className={`text-sm h-8 ${activeFilter === filter.id
                            ? 'bg-white text-navy shadow-sm hover:bg-white'
                            : 'text-gray-500 hover:text-navy hover:bg-gray-200'
                        }`}
                >
                    {filter.label}
                </Button>
            ))}
        </div>
    );
}
