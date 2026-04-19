declare namespace Express {
  interface Request {
    user?: {
      id: string;
      role: string;
      status: string;
      email: string;
    };
  }
}
