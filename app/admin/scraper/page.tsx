export default function ScraperPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Zaytoonz Scraper</h1>
      <p className="text-gray-600 mb-6">Web scraping tools for opportunities and resources</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Resource Manager</h3>
          <p className="text-gray-600 mb-4">Manage scraped resources and data sources</p>
          <button className="w-full bg-[#556B2F] text-white py-2 px-4 rounded hover:bg-[#6B8E23] transition-colors">
            Open Manager
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Scraped Jobs</h3>
          <p className="text-gray-600 mb-4">View and manage scraped job opportunities</p>
          <a href="/admin/scraper/jobs" className="block w-full bg-[#556B2F] text-white py-2 px-4 rounded hover:bg-[#6B8E23] transition-colors text-center">
            View Jobs
          </a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Scraped Funds</h3>
          <p className="text-gray-600 mb-4">View and manage scraped funding opportunities</p>
          <button className="w-full bg-[#556B2F] text-white py-2 px-4 rounded hover:bg-[#6B8E23] transition-colors">
            View Funds
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Scraped Trainings</h3>
          <p className="text-gray-600 mb-4">View and manage scraped training opportunities</p>
          <button className="w-full bg-[#556B2F] text-white py-2 px-4 rounded hover:bg-[#6B8E23] transition-colors">
            View Trainings
          </button>
        </div>
      </div>
    </div>
  );
} 