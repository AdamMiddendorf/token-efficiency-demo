export interface ErrorBody {
  error: string;
  code?: string;
  issues?: { field: string; message: string }[];
}

export interface HandlerResponse<T> {
  status: number;
  body: T | ErrorBody;
}

export function isErrorBody<T>(body: T | ErrorBody): body is ErrorBody {
  return typeof body === "object" && body !== null && "error" in body;
}
