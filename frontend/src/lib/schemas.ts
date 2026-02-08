import * as z from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['buyer', 'seller', 'agent']),
})

export type SignupFormValues = z.infer<typeof signupSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(100, 'Price must be at least 100'),
  location: z.string().min(3, 'Location is required'),
  type: z.enum(['rent', 'sell']),
  bedrooms: z.number().min(0, 'Bedrooms cannot be negative'),
  bathrooms: z.number().min(0, 'Bathrooms cannot be negative'),
  area_sqft: z.number().min(0, 'Area cannot be negative'),
  year_built: z.number().min(1800).max(new Date().getFullYear() + 5).optional(),
  amenities: z.array(z.string()),
  furnishing_status: z.enum(['furnished', 'semi-furnished', 'unfurnished']),
  property_age: z.enum(['new', 'resale']),
  floor_number: z.number().int().optional(),
  total_floors: z.number().int().optional(),
  ownership_docs: z.any().optional(), // Will handle file conversion in component
  images: z.any().optional(), // Will handle file conversion in component
  video_url: z.string().min(5, 'Video is mandatory, please upload one.'),
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude'),
})

export type PropertyFormValues = z.infer<typeof propertySchema>

export const searchSchema = z.object({
  location: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  type: z.enum(['rent', 'sell', 'all']).default('all'),
})

export type SearchFormValues = z.infer<typeof searchSchema>

export const agentOnboardingSchema = z.object({
  license_number: z.string().min(5, "License number is required"),
  experience_years: z.number().min(0, "Experience must be positive").optional(),
  specialization: z.string().optional(),
  office_address: z.string().optional(),
  // Files are handled separately in the component
})

export type AgentOnboardingFormValues = z.infer<typeof agentOnboardingSchema>

export const agentProfileSchema = z.object({
  experience_years: z.number().min(0, "Experience must be positive").default(0),
  specialization: z.string().optional(),
  office_address: z.string().optional(),
})

export type AgentProfileFormValues = z.infer<typeof agentProfileSchema>

export const propertyDocumentSchema = z.object({
  // This might be used if we add metadata fields for docs later
  notes: z.string().optional(),
})
