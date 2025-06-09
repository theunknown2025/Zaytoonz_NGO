# Database Schema for Application Evaluations

This document outlines the database tables and schema needed to support the Application Evaluation feature.

## Tables Required

### 1. opportunity_evaluations
Links opportunities with their selected evaluation templates.

```sql
CREATE TABLE opportunity_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL,
  evaluation_id VARCHAR(255) NOT NULL, -- For now using VARCHAR since evaluations are in localStorage
  evaluation_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_opportunity_evaluations_opportunity_id ON opportunity_evaluations(opportunity_id);
```

### 2. application_evaluations
Stores the actual evaluation results for each application.

```sql
CREATE TABLE application_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  opportunity_id UUID NOT NULL,
  evaluation_id VARCHAR(255) NOT NULL,
  evaluation_data JSONB NOT NULL DEFAULT '{}', -- Store the evaluation results (criteria scores)
  total_score DECIMAL(10,2),
  max_score DECIMAL(10,2),
  percentage_score DECIMAL(5,2),
  evaluated_by UUID, -- NGO user who performed the evaluation
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(application_id, evaluation_id) -- One evaluation per application per template
);

CREATE INDEX idx_application_evaluations_application_id ON application_evaluations(application_id);
CREATE INDEX idx_application_evaluations_opportunity_id ON application_evaluations(opportunity_id);
CREATE INDEX idx_application_evaluations_evaluation_id ON application_evaluations(evaluation_id);
CREATE INDEX idx_application_evaluations_evaluated_by ON application_evaluations(evaluated_by);
```

### 3. Triggers for updated_at timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_opportunity_evaluations_updated_at BEFORE UPDATE ON opportunity_evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_evaluations_updated_at BEFORE UPDATE ON application_evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Data Structure

### evaluation_data JSONB structure:
```json
{
  "criteria": [
    {
      "label": "Technical Skills",
      "score": 8
    },
    {
      "label": "Communication",
      "score": 9
    }
  ],
  "totalScore": 17,
  "maxScore": 20,
  "percentageScore": 85.0,
  "notes": "Excellent candidate with strong technical background",
  "evaluatedAt": "2024-01-15T10:30:00Z",
  "evaluatedBy": "user_uuid_here"
}
```

## API Endpoints

The following API endpoints are implemented in `/app/api/evaluations/applications/route.ts`:

- `GET /api/evaluations/applications?applicationId=xxx&evaluationId=xxx` - Get evaluation for an application
- `POST /api/evaluations/applications` - Save new evaluation
- `PUT /api/evaluations/applications` - Update existing evaluation  
- `DELETE /api/evaluations/applications?evaluationId=xxx&applicationId=xxx` - Delete evaluation

## Current Implementation Status

**Current State**: Using localStorage for data persistence due to database access limitations.

**Next Steps When Database Access Available**:
1. Execute the SQL migrations above to create the tables
2. Update the API endpoints in `/app/api/evaluations/applications/route.ts` to use Supabase
3. Replace localStorage calls in `ApplicationEvaluation.tsx` with API calls
4. Implement proper user authentication for `evaluated_by` field

## Integration Points

### With Opportunity Creation
- When Step 5 (Evaluation) is completed in opportunity creation, save the selected evaluation template ID to `opportunity_evaluations` table
- Currently stored in localStorage with key: `opportunity_evaluation_{opportunityId}`

### With Applications Page
- The `ApplicationEvaluation` component is integrated into `/app/ngo/applications/page.tsx`
- Shows up in the expanded application details section
- Provides radar chart visualization and scoring interface

### Data Flow
1. NGO creates evaluation template in Evaluation Maker tool
2. NGO selects evaluation template in Step 5 of opportunity creation
3. Applications are submitted by seekers
4. NGO views applications and can evaluate candidates using the selected template
5. Evaluation results are saved with scores, notes, and timestamps
6. Results persist and can be edited/updated later

## Future Enhancements

When database is available, consider adding:
- Evaluation history/audit trail
- Bulk evaluation operations
- Evaluation comparison reports
- Export functionality for evaluation data
- Email notifications when evaluations are completed 