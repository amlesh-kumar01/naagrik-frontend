import { notFound } from 'next/navigation';

// This function generates metadata for the issue detail page
export async function generateMetadata({ params }) {
  const { id: issueId } = await params;
  
  // You can fetch issue data here for better SEO metadata
  // For now, we'll use a basic title
  return {
    title: `Issue #${issueId} - Naagrik`,
    description: 'View and interact with community issues on Naagrik platform',
    openGraph: {
      title: `Issue #${issueId} - Naagrik`,
      description: 'Community issue details and discussions',
      type: 'article',
    },
  };
}

export default function IssueLayout({ children }) {
  return children;
}
