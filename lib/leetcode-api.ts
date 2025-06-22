// LeetCode GraphQL API service via server-side proxy
// 
// This service now uses a server-side proxy to avoid CORS issues.
// Authentication is handled through the storage service.

import { storageService } from './storage';

interface SubmissionDetails {
  runtime: number;
  runtimeDisplay: string;
  runtimePercentile: number;
  runtimeDistribution: string;
  memory: number;
  memoryDisplay: string;
  memoryPercentile: number;
  memoryDistribution: string;
  code: string;
  timestamp: number;
  statusCode: number;
  user: {
    username: string;
    profile: {
      realName: string;
      userAvatar: string;
    };
  };
  lang: {
    name: string;
    verboseName: string;
  };
  question: {
    questionId: string;
    titleSlug: string;
    hasFrontendPreview: boolean;
  };
  notes: string;
  flagType: string;
  topicTags: Array<{
    tagId: string;
    slug: string;
    name: string;
  }>;
  runtimeError: string | null;
  compileError: string | null;
  lastTestcase: string;
  codeOutput: string;
  expectedOutput: string;
  totalCorrect: number;
  totalTestcases: number;
  fullCodeOutput: string | null;
  testDescriptions: string | null;
  testBodies: string | null;
  testInfo: string | null;
  stdOutput: string | null;
}

interface SubmissionDetailsResponse {
  data: {
    submissionDetails: SubmissionDetails | null;
  };
  errors?: Array<{
    message: string;
    locations: Array<{
      line: number;
      column: number;
    }>;
    path: string[];
  }>;
}

const SUBMISSION_DETAILS_QUERY = `
query submissionDetails($submissionId: Int!) {
  submissionDetails(submissionId: $submissionId) {
    runtime
    runtimeDisplay
    runtimePercentile
    runtimeDistribution
    memory
    memoryDisplay
    memoryPercentile
    memoryDistribution
    code
    timestamp
    statusCode
    user {
      username
      profile {
        realName
        userAvatar
      }
    }
    lang {
      name
      verboseName
    }
    question {
      questionId
      titleSlug
      hasFrontendPreview
    }
    notes
    flagType
    topicTags {
      tagId
      slug
      name
    }
    runtimeError
    compileError
    lastTestcase
    codeOutput
    expectedOutput
    totalCorrect
    totalTestcases
    fullCodeOutput
    testDescriptions
    testBodies
    testInfo
    stdOutput
  }
}`;

// Helper function to get authentication headers for the proxy
function getProxyHeaders(): Record<string, string> {
  const authConfig = storageService.getAuthConfig();
  
  if (!authConfig) {
    throw new Error('Authentication not configured');
  }

  return {
    'Content-Type': 'application/json',
    'x-csrf-token': authConfig.csrftoken,
    'x-session-cookie': authConfig.sessionCookie
  };
}

export async function fetchSubmissionDetails(submissionId: number): Promise<SubmissionDetails | null> {
  try {
    // Check if authentication is configured
    if (!storageService.isAuthConfigured()) {
      // Authentication not configured for submission details
      return null;
    }

    const response = await fetch('/api/leetcode-graphql-proxy', {
      method: 'POST',
      headers: getProxyHeaders(),
      body: JSON.stringify({
        query: SUBMISSION_DETAILS_QUERY,
        variables: { submissionId },
        operationName: 'submissionDetails'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('GraphQL proxy error:', response.status, errorData);
      return null;
    }

    const data: SubmissionDetailsResponse = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return null;
    }

    return data.data.submissionDetails;
  } catch (error) {
    console.error('Error fetching submission details:', error);
    return null;
  }
}

// Helper function to extract submission ID from URL
export function extractSubmissionId(url: string): number | null {
  const match = url.match(/\/submissions\/detail\/(\d+)\//);
  return match ? parseInt(match[1], 10) : null;
}

// Helper function to parse runtime distribution
export function parseRuntimeDistribution(distribution: string): Array<{ range: string; percentage: number }> {
  try {
    const parsed = JSON.parse(distribution);
    return parsed.distribution.map(([range, percentage]: [string, number]) => ({
      range: `${range}ms`,
      percentage
    }));
  } catch {
    return [];
  }
}

// Helper function to parse memory distribution
export function parseMemoryDistribution(distribution: string): Array<{ range: string; percentage: number }> {
  try {
    const parsed = JSON.parse(distribution);
    return parsed.distribution.map(([range, percentage]: [string, number]) => ({
      range: `${(parseInt(range) / 1000).toFixed(1)}MB`,
      percentage
    }));
  } catch {
    return [];
  }
}

export type { SubmissionDetails }; 