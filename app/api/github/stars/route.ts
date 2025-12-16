import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.github.com/repos/yunweneric/ccmc_notes',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch repository data');
    }

    const data = await response.json();
    return NextResponse.json({ stars: data.stargazers_count || 0 });
  } catch (error) {
    console.error('Error fetching GitHub stars:', error);
    // Return 0 stars on error so the component still renders
    return NextResponse.json({ stars: 0 });
  }
}

