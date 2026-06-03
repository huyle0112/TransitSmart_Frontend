import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface FilterTabsProps {
    activeFilter: string;
    onChange: (filterId: string) => void;
}

export default function FilterTabs({ activeFilter, onChange }: FilterTabsProps) {
    const { t } = useTranslation();

    const FILTERS = [
        { id: 'fastest', label: t('home.fastest') },
        { id: 'fewest_transfers', label: t('home.fewestTransfers') },
        { id: 'least_walking', label: t('home.leastWalking') },
    ];

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
