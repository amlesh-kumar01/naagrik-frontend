import IssueDetailPage from '../../../components/pages/IssueDetailPage';

export const metadata = {
  title: 'Issue Details - CivicConnect',
  description: 'View and interact with community issues',
};

export default function IssuePage({ params }) {
  return <IssueDetailPage issueId={params.id} />;
}
