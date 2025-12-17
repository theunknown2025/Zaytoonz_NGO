import { JobRequirement, ComparisonResult, JobAnalysis } from '../types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const analyzeJobDescription = async (text: string): Promise<JobAnalysis> => {
  try {
    const prompt = `Analyze this job description and identify the main requirement categories/sections.
    Return ONLY a JSON object with:
    1. "sections": array of category names found in the description
    2. "description": brief explanation of what each section represents
    
    Example format:
    {
      "sections": ["Technical Skills", "Project Management", "Industry Knowledge"],
      "description": "The job requires expertise in three main areas..."
    }
    
    Job Description:
    ${text}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error('No response from OpenAI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Error analyzing job sections:', error);
    throw error;
  }
};

export const extractRequirements = async (text: string, approvedSections: string[]): Promise<JobRequirement[]> => {
  try {
    const prompt = `Extract key requirements from this job description for the following approved sections: ${approvedSections.join(", ")}.
    Return ONLY a JSON object where each approved section is a key with:
    1. "keywords": array of specific requirements or skills
    2. "description": brief explanation of the requirements
    
    Example format:
    {
      "Technical Skills": {
        "keywords": ["JavaScript", "React", "Node.js"],
        "description": "Strong focus on full-stack JavaScript development"
      }
    }
    
    Job Description:
    ${text}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error('No response from OpenAI');

    const parsed = JSON.parse(response);
    const requirements: JobRequirement[] = [];

    Object.entries(parsed).forEach(([category, data]: [string, any]) => {
      if (data.keywords && Array.isArray(data.keywords) && data.keywords.length > 0) {
        requirements.push({
          category,
          keywords: data.keywords,
          description: data.description,
          score: 0,
          maxScore: data.keywords.length
        });
      }
    });

    return requirements;
  } catch (error) {
    console.error('Error extracting requirements:', error);
    throw error;
  }
};

export const compareCV = async (cv: string, requirements: JobRequirement[]): Promise<ComparisonResult> => {
  try {
    const prompt = `Compare this CV against the job requirements and provide detailed feedback.
    Return ONLY a JSON object with:
    1. Each category containing:
       - "matched": array of found keywords
       - "feedback": specific feedback for this category
    2. "generalFeedback": overall analysis and suggestions
    
    Requirements:
    ${JSON.stringify(requirements, null, 2)}
    
    CV:
    ${cv}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error('No response from OpenAI');

    const matches = JSON.parse(response);
    let totalScore = 0;
    let maxScore = 0;

    const updatedRequirements = requirements.map(req => {
      const categoryMatches = matches[req.category]?.matched || [];
      const score = categoryMatches.length;
      totalScore += score;
      maxScore += req.maxScore;

      return {
        ...req,
        score,
        feedback: matches[req.category]?.feedback
      };
    });

    return {
      requirements: updatedRequirements,
      overallScore: totalScore,
      maxScore,
      generalFeedback: matches.generalFeedback
    };
  } catch (error) {
    console.error('Error comparing CV:', error);
    throw error;
  }
};