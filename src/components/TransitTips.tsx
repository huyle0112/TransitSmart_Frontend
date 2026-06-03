import { Lightbulb, BadgeCheck, Clock, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TransitTips() {
  const { t } = useTranslation();

  const tips = [
    {
      icon: <Ticket className="w-4 h-4 text-orange" />,
      text: t('tips.tip1')
    },
    {
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      text: t('tips.tip2')
    },
    {
      icon: <BadgeCheck className="w-4 h-4 text-green-500" />,
      text: t('tips.tip3')
    },
    {
      icon: <Lightbulb className="w-4 h-4 text-yellow-500" />,
      text: t('tips.tip4')
    }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-semibold text-navy mb-4 flex items-center">
        <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
        {t('tips.title')}
      </h3>
      <ul className="space-y-4">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0 bg-gray-50 p-1.5 rounded-full">
              {tip.icon}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{tip.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

