import { getApiClient } from "@/lib/client";
import type {
  LogQuery,
  OperationLog,
} from "@/server/routes/operation-logs/dtos";
import type { PaginatedResponse } from "../create-resource";
import { createReadonlyResource } from "../create-resource";

const getClient = () => getApiClient()["operation-logs"];

type OperationLogPage = PaginatedResponse<OperationLog>;

const operationLogResource = createReadonlyResource<OperationLogPage, LogQuery>(
  {
    resourceName: "operation-logs",
    getClient: getClient as never,
    messages: {
      list: "获取操作日志列表失败",
      delete: "删除操作日志失败",
    },
  },
);

export const operationLogKeys = operationLogResource.keys;
export const useOperationLogs = operationLogResource.useList;
export const useDeleteOperationLog = operationLogResource.useDelete;
