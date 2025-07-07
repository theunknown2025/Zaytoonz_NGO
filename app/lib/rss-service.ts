// RSS.app API Integration Service
import { JobData } from './scraper';

export interface RSSFeedItem {
  url: string;
  title: string;
  description_text?: string;
  description_html?: string;
  content_text?: string;
  content_html?: string;
  thumbnail?: string;
  authors: Array<{ name: string }>;
  date_published: string;
}

export interface RSSFeed {
  id: string;
  title: string;
  source_url: string;
  rss_feed_url: string;
  description: string;
  icon?: string;
  items?: RSSFeedItem[];
}

export interface RSSFeedResponse {
  data: RSSFeed[];
  total: number;
  offset: number;
  limit: number;
}

export interface CreateFeedRequest {
  url: string;
  title?: string;
  description?: string;
}

export interface CreateFeedResponse {
  id: string;
  title: string;
  source_url: string;
  rss_feed_url: string;
  description: string;
  icon?: string;
}

class RSSService {
  private baseUrl = 'https://api.rss.app/v1';
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.apiKey = process.env.RSS_APP_API_KEY || '';
    this.apiSecret = process.env.RSS_APP_API_SECRET || '';
    
    if (!this.apiKey || !this.apiSecret) {
      console.warn('RSS.app API credentials not found. Please set RSS_APP_API_KEY and RSS_APP_API_SECRET environment variables.');
    }
  }

  private getAuthHeader(): string {
    return `Bearer ${this.apiKey}:${this.apiSecret}`;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`RSS.app API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  }

  // Create a new RSS feed from a URL
  async createFeed(request: CreateFeedRequest): Promise<CreateFeedResponse> {
    return await this.makeRequest<CreateFeedResponse>('/feeds', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get all feeds
  async getFeeds(limit: number = 20, offset: number = 0): Promise<RSSFeedResponse> {
    return await this.makeRequest<RSSFeedResponse>(`/feeds?limit=${limit}&offset=${offset}`);
  }

  // Get a specific feed by ID
  async getFeed(feedId: string): Promise<RSSFeed> {
    return await this.makeRequest<RSSFeed>(`/feeds/${feedId}`);
  }

  // Delete a feed
  async deleteFeed(feedId: string): Promise<{ id: string; deleted: boolean }> {
    return await this.makeRequest<{ id: string; deleted: boolean }>(`/feeds/${feedId}`, {
      method: 'DELETE',
    });
  }

  // Import jobs directly from RSS.app JSON feed URL
  async importFromRSSFeedURL(feedUrl: string): Promise<{ jobs: JobData[], feedInfo: any }> {
    try {
      const response = await fetch(feedUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.status}`);
      }
      
      const feedData = await response.json();
      
      // Validate JSON feed format
      if (!feedData.items || !Array.isArray(feedData.items)) {
        throw new Error('Invalid RSS feed format: missing items array');
      }
      
      // Convert RSS items to job format
      const jobs = this.convertRSSItemsToJobs(feedData.items, feedData.title || 'RSS Feed');
      
      return {
        jobs,
        feedInfo: {
          title: feedData.title,
          description: feedData.description,
          home_page_url: feedData.home_page_url,
          feed_url: feedData.feed_url,
          itemCount: feedData.items.length,
        }
      };
    } catch (error) {
      console.error('Error importing from RSS feed URL:', error);
      throw error;
    }
  }

    // Convert RSS feed items to JobData format
  convertRSSItemsToJobs(items: RSSFeedItem[], feedTitle: string): JobData[] {
    if (!Array.isArray(items)) {
      console.warn('Items is not an array:', items);
      return [];
    }

    return items.filter(item => item && typeof item === 'object').map((item, index) => {
      // Handle both standard RSS format and JSON Feed format
      const contentText = item.content_text || item.description_text || '';
      const contentHtml = item.content_html || item.description_html || '';
      const fullContent = contentText || contentHtml || 'No description available';
      
      return {
        id: `rss-${Date.now()}-${index}`,
        title: this.cleanJobTitle(item.title) || 'Untitled Job',
        company: this.extractCompanyFromTitle(item.title) || this.extractCompanyFromContent(contentText) || feedTitle || 'Unknown Company',
        location: this.extractLocationFromDescription(contentText) || this.extractLocationFromTitle(item.title) || '',
        job_type: this.extractJobTypeFromDescription(contentText) || '',
        description: fullContent,
        source_url: item.url || '',
        scraped_at: new Date().toISOString(),
        tags: this.generateTagsFromRSSItem(item),
        experience_level: this.extractExperienceFromDescription(contentText) || '',
        remote_work: this.isRemoteFromDescription(contentText),
        salary_range: this.extractSalaryFromDescription(contentText) || '',
      };
    });
  }

  // Helper method to extract company from title
  private extractCompanyFromTitle(title?: string): string | undefined {
    if (!title || typeof title !== 'string') return undefined;
    
    const patterns = [
      /at\s+([^-]+)/i,
      /chez\s+([^-]+)/i,
      /([^-]+)\s*-\s*job/i,
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  // Helper method to extract location from description
  private extractLocationFromDescription(description?: string): string | undefined {
    if (!description || typeof description !== 'string') return undefined;
    
    const locationPatterns = [
      /location[:\s]+([^,.\n]+)/i,
      /based in ([^,.\n]+)/i,
      /([^,.\n]+),\s*(france|morocco|tunisia|algeria)/i,
    ];

    for (const pattern of locationPatterns) {
      const match = description.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  // Helper method to extract job type from description
  private extractJobTypeFromDescription(description?: string): string | undefined {
    if (!description || typeof description !== 'string') return undefined;
    
    const jobTypePatterns = [
      /(full[- ]?time|temps plein)/i,
      /(part[- ]?time|temps partiel)/i,
      /(contract|contrat)/i,
      /(internship|stage)/i,
      /(freelance|indépendant)/i,
    ];

    for (const pattern of jobTypePatterns) {
      const match = description.match(pattern);
      if (match) {
        return match[1].toLowerCase().replace('-', ' ');
      }
    }
    return undefined;
  }

  // Helper method to extract experience level
  private extractExperienceFromDescription(description?: string): string | undefined {
    if (!description || typeof description !== 'string') return undefined;
    
    if (/(senior|expérimenté|5\+|expert)/i.test(description)) return 'Senior';
    if (/(junior|débutant|entry|0-2)/i.test(description)) return 'Junior';
    if (/(mid|moyen|2-5)/i.test(description)) return 'Mid-level';
    return undefined;
  }

  // Helper method to check for remote work
  private isRemoteFromDescription(description?: string): boolean {
    if (!description || typeof description !== 'string') return false;
    return /(remote|télétravail|distance|home)/i.test(description);
  }

  // Helper method to generate tags from RSS item
  private generateTagsFromRSSItem(item: RSSFeedItem): string[] {
    const tags: string[] = [];
    const title = item.title || '';
    const description = item.content_text || item.description_text || '';
    const text = `${title} ${description}`.toLowerCase();

    const skillKeywords = [
      'javascript', 'typescript', 'react', 'node.js', 'python', 'java', 'php',
      'css', 'html', 'vue', 'angular', 'mongodb', 'sql', 'aws', 'docker',
      'kubernetes', 'devops', 'machine learning', 'ai', 'blockchain'
    ];

    skillKeywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        tags.push(keyword);
      }
    });

    return tags.slice(0, 5); // Limit to 5 tags
  }

  // Helper method to clean job titles
  private cleanJobTitle(title?: string): string {
    if (!title || typeof title !== 'string') return '';
    
    // Remove company names in brackets like [Company Name]
    let cleaned = title.replace(/\[.*?\]\s*/g, '');
    // Remove extra whitespace
    cleaned = cleaned.trim();
    return cleaned || title; // Return original if empty after cleaning
  }

  // Helper method to extract company from content
  private extractCompanyFromContent(content?: string): string | undefined {
    if (!content || typeof content !== 'string') return undefined;
    
    const companyPatterns = [
      /recrute\s+([^.]+)/i, // "recrute Company"
      /recrutement\s+([^.]+)/i, // "recrutement Company" 
      /société\s+([^.]+)/i, // "société Company"
      /entreprise\s+([^.]+)/i, // "entreprise Company"
      /chez\s+([^.]+)/i, // "chez Company"
    ];

    for (const pattern of companyPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  // Helper method to extract location from title
  private extractLocationFromTitle(title?: string): string | undefined {
    if (!title || typeof title !== 'string') return undefined;
    
    const locationPatterns = [
      /béni mellal/i,
      /casablanca/i,
      /rabat/i,
      /marrakech/i,
      /fès/i,
      /tanger/i,
      /agadir/i,
      /([a-zA-ZÀ-ÿ\s]+)\s*-\s*emploi/i, // "Location - emploi"
    ];

    for (const pattern of locationPatterns) {
      const match = title.match(pattern);
      if (match) {
        return match[1] ? match[1].trim() : match[0].trim();
      }
    }
    return undefined;
  }

  // Helper method to extract salary from description
  private extractSalaryFromDescription(description?: string): string | undefined {
    if (!description || typeof description !== 'string') return undefined;
    
    const salaryPatterns = [
      /salaire[:\s]+([^.\n]+)/i,
      /rémunération[:\s]+([^.\n]+)/i,
      /(\d+[\s,]?\d*)\s*(dh|mad|euro|€|\$)/i,
      /entre\s+(\d+[\s,]?\d*)\s*et\s*(\d+[\s,]?\d*)/i,
    ];

    for (const pattern of salaryPatterns) {
      const match = description.match(pattern);
      if (match) {
        if (match[2]) {
          return `${match[1]} - ${match[2]}`;
        }
        return match[1].trim();
      }
    }
    return undefined;
  }
}

export const rssService = new RSSService(); 