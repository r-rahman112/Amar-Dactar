import { z } from 'zod';

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password is too long');
const emailSchema = z.string().email('Invalid email address').max(255);
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name is too long');

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required')
  })
});

export const signupSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    fullName: nameSchema,
    mobile: z.string().max(20).optional().nullable(),
    profile: z.record(z.string(), z.any()).optional().nullable(),
    hasAcceptedConsent: z.boolean().refine(val => val === true, {
      message: 'You must accept the healthcare disclaimer.',
    }),
  })
});

export const requestOtpSchema = z.object({
  body: z.object({
    identifier: z.string().max(255),
    type: z.enum(['signup', 'password_reset', 'phone'])
  })
});

export const verifyOtpSchema = z.object({
  body: z.object({
    identifier: z.string().max(255),
    type: z.enum(['signup', 'password_reset', 'phone']),
    otp: z.string().length(6, 'OTP must be 6 digits')
  })
});

export const adminCreateUserSchema = signupSchema;

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['active', 'suspended', 'banned', 'Pending Verification', 'Verified'])
  }),
  params: z.object({
    id: z.string().uuid('Invalid user ID')
  })
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(['user', 'doctor', 'admin', 'assistant_admin'])
  }),
  params: z.object({
    id: z.string().uuid('Invalid user ID')
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: passwordSchema
  }),
  params: z.object({
    id: z.string().uuid('Invalid user ID')
  })
});

export const aiChatSchema = z.object({
  body: z.object({
    messages: z.array(z.object({
      id: z.string().optional(),
      sender: z.enum(['user', 'assistant']),
      text: z.string().max(5000)
    })).min(1).max(50)
  })
});

export const aiSymptomSchema = z.object({
  body: z.object({
    symptoms: z.string().min(1).max(5000, 'Symptoms text is too long')
  })
});

export const aiReportSchema = z.object({
  body: z.object({
    reportText: z.string().min(1).max(50000, 'Report text is too long')
  })
});

export const reviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().max(2000, 'Comment is too long').optional().nullable()
  }),
  params: z.object({
    doctorId: z.string().uuid('Invalid doctor ID')
  }).optional()
});

export const doctorProfileSchema = z.object({
  body: z.object({
    specializations: z.array(z.string().max(100)).max(20).optional(),
    experience: z.number().min(0).max(100).optional(),
    education: z.array(z.string().max(255)).max(10).optional(),
    about: z.string().max(2000).optional(),
    hospitals: z.array(z.string().max(255)).max(10).optional(),
    consultationFee: z.number().min(0).max(100000).optional()
  })
});
