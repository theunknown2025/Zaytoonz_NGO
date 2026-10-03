import OpportunityDetailById from '@/app/components/OpportunityDetailById';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NgoOpportunityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <OpportunityDetailById id={params.id} audience="ngo" />;
}
