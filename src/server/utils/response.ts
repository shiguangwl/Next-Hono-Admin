import type { Context } from "hono";

export const SuccessCode = {
  OK: "OK",
} as const;

export type ApiSuccessResponse<T> = {
  code: "OK";
  data: T;
  message?: string;
};

export type EmptyApiSuccessResponse = {
  code: "OK";
  data: null;
  message?: string;
};

export const R = {
  ok<T>(c: Context, data: T, message?: string) {
    return c.json({
      code: SuccessCode.OK,
      data,
      ...(message && { message }),
    });
  },

  success(c: Context, message = "操作成功") {
    return c.json({
      code: SuccessCode.OK,
      data: null,
      message,
    });
  },
};
