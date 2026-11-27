import {
  BoxIcon,
  ChipIcon,
  HeadphonesIcon,
  KeyboardIcon,
  LaptopIcon,
  MonitorIcon,
  MouseIcon,
  PhoneIcon,
  PrinterIcon,
  TabletIcon,
} from "@/components/ui/icons";

// Picks a glyph from the category's name (free text, Russian or English).
const RULES: [RegExp, (p: { className?: string }) => React.ReactElement][] = [
  [/ноут|laptop|notebook|macbook/i, LaptopIcon],
  [/монит|monitor|display|экран|desktop|компьютер|моноблок|\bпк\b/i, MonitorIcon],
  [/принт|printer|мфу|сканер/i, PrinterIcon],
  [/мыш|mouse/i, MouseIcon],
  [/клав|keyboard/i, KeyboardIcon],
  [/науш|гарнит|audio|звук|колон|headphone|speaker/i, HeadphonesIcon],
  [/планш|tablet|ipad/i, TabletIcon],
  [/телеф|смартф|phone/i, PhoneIcon],
  [/комплект|процесс|видеок|памят|ssd|hdd|диск|cpu|gpu|ram|компонент/i, ChipIcon],
];

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = RULES.find(([re]) => re.test(name))?.[1] ?? BoxIcon;
  return <Icon className={className} />;
}
