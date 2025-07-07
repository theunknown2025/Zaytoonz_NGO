import { NextRequest, NextResponse } from 'next/server';
import { rssService } from '@/app/lib/rss-service';

// GET - Retrieve all RSS feeds
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const feeds = await rssService.getFeeds(limit, offset);
    
    return NextResponse.json({
      success: true,
      feeds: feeds.data,
      total: feeds.total,
      offset: feeds.offset,
      limit: feeds.limit,
    });
  } catch (error: any) {
    console.error('Error fetching RSS feeds:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch RSS feeds',
    }, { status: 500 });
  }
}

// POST - Create a new RSS feed or import jobs from existing feed or RSS feed URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, url, title, description, feedId, feedUrl } = body;

    if (action === 'create') {
      // Create new RSS feed
      if (!url) {
        return NextResponse.json({
          success: false,
          error: 'URL is required to create RSS feed',
        }, { status: 400 });
      }

      const feed = await rssService.createFeed({
        url,
        title,
        description,
      });

      return NextResponse.json({
        success: true,
        feed,
        message: 'RSS feed created successfully',
      });
    } 
    
    else if (action === 'import-jobs') {
      // Import jobs from existing RSS feed
      if (!feedId) {
        return NextResponse.json({
          success: false,
          error: 'Feed ID is required to import jobs',
        }, { status: 400 });
      }

      const feed = await rssService.getFeed(feedId);
      
      if (!feed.items || feed.items.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No items found in RSS feed',
        }, { status: 400 });
      }

      // Convert RSS items to job format
      const jobs = rssService.convertRSSItemsToJobs(feed.items, feed.title);

      return NextResponse.json({
        success: true,
        jobs,
        feed: {
          id: feed.id,
          title: feed.title,
          source_url: feed.source_url,
          rss_feed_url: feed.rss_feed_url,
        },
        message: `Imported ${jobs.length} jobs from RSS feed`,
      });
    }

    else if (action === 'import-from-url') {
      // Import jobs directly from RSS feed URL
      if (!feedUrl) {
        return NextResponse.json({
          success: false,
          error: 'RSS feed URL is required',
        }, { status: 400 });
      }

      const result = await rssService.importFromRSSFeedURL(feedUrl);

      return NextResponse.json({
        success: true,
        jobs: result.jobs,
        feedInfo: result.feedInfo,
        message: `Imported ${result.jobs.length} jobs from RSS feed URL`,
      });
    }
    
    else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use "create", "import-jobs", or "import-from-url"',
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in RSS feed operation:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process RSS feed operation',
    }, { status: 500 });
  }
}

// DELETE - Delete RSS feed
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const feedId = searchParams.get('feedId');

    if (!feedId) {
      return NextResponse.json({
        success: false,
        error: 'Feed ID is required',
      }, { status: 400 });
    }

    const result = await rssService.deleteFeed(feedId);

    return NextResponse.json({
      success: true,
      result,
      message: 'RSS feed deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting RSS feed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete RSS feed',
    }, { status: 500 });
  }
} 