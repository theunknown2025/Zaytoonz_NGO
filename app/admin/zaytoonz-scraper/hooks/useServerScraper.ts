import { useState, useCallback } from 'react';
import { FieldMapping, ExtractedData } from '../types';

export const useServerScraper = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrapeWebsite = useCallback(async (
    url: string,
    fields: FieldMapping[]
  ): Promise<ExtractedData | null> => {
    setLoading(true);
    setError(null);

    try {
      // Make request to our simple scraper API (avoids cheerio/undici issues)
      const response = await fetch('/api/scraper/zaytoonz-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          fields,
          itemSelector: 'article, .post, .item, .entry, .job, .offre, .opportunity'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to scrape website');
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('No data could be extracted from this website. The site might not have the expected structure or the selectors need adjustment.');
      }

      return {
        items: data.items,
        total: data.total,
        config: data.config,
        debug: data.debug,
        aiAnalysis: data.aiAnalysis
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scrape website';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    scrapeWebsite,
    loading,
    error
  };
}; 