import { Metadata } from 'next';
import PlanetDetailPageClient from './PlanetDetailPageClient';
import { MOCK_PLANETS } from '@/lib/mockData';

interface PageProps {
  params: {
    planetId: string;
  };
}

// Generate dynamic SEO metadata for each celebrity/planet on the server
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const planet = MOCK_PLANETS.find((p) => p.id === params.planetId);

  if (!planet) {
    return {
      title: 'Hành tinh Danh nhân | Danh nhân Bắc Đẩu',
      description: 'Khám phá cuộc đời và thành tựu của các danh nhân trong lịch sử.'
    };
  }

  return {
    title: `${planet.name} | Danh nhân Bắc Đẩu`,
    description: planet.bio || `Khám phá cuộc đời, tiểu sử, sự nghiệp và các thành tựu vĩ đại của danh nhân ${planet.name} trong hệ tri thức Bắc Đẩu.`
  };
}

export default function PlanetDetailPage({ params }: PageProps) {
  return <PlanetDetailPageClient planetId={params.planetId} />;
}
