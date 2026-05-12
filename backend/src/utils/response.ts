import { Request, Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function sendSuccess<T>(res: Response, data: T, message = "Success", statusCode = 200): void {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  } satisfies ApiResponse<T>);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = "Success"
): void {
  res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  } satisfies ApiResponse<T[]>);
}

export function sendError(res: Response, message: string, statusCode = 400): void {
  res.status(statusCode).json({
    success: false,
    message,
  } satisfies ApiResponse);
}
