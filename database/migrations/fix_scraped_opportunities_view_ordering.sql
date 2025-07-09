-- Fix ordering issue in scraped_opportunities_complete view
-- Remove ORDER BY clause from view to allow API to control ordering

CREATE OR REPLACE VIEW scraped_opportunities_complete AS
SELECT 
    so.id,
    so.title,
    so.opportunity_type,
    so.source_url,
    so.status,
    so.scraped_at,
    so.created_at,
    so.updated_at,
    sod.description,
    sod.location,
    sod.company,
    sod.hours,
    sod.deadline,
    sod.requirements,
    sod.benefits,
    sod.salary_range,
    sod.contact_info,
    sod.tags,
    sod.metadata,
    so.scraper_config
FROM scraped_opportunities so
LEFT JOIN scraped_opportunity_details sod ON so.id = sod.scraped_opportunity_id; 