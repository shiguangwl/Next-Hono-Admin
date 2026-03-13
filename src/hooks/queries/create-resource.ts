import { unwrapApiData } from "@/lib/client";
import type {
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BasePaginationQuery {
  page?: number;
  pageSize?: number;
}

export interface ResourceConfig<
  _TQuery extends BasePaginationQuery = BasePaginationQuery,
> {
  resourceName: string;
  defaultPageSize?: number;
  messages?: {
    list?: string;
    detail?: string;
    create?: string;
    update?: string;
    delete?: string;
  };
  defaultQueryOptions?: Partial<UseQueryOptions>;
  defaultMutationOptions?: Partial<UseMutationOptions>;
}

export interface QueryKeys {
  all: readonly [string];
  lists: () => readonly [string, "list"];
  list: <P extends Record<string, unknown>>(
    params?: P,
  ) => readonly [string, "list", P?];
  details: () => readonly [string, "detail"];
  detail: (id: number) => readonly [string, "detail", number];
}

export function createQueryKeys(resourceName: string): QueryKeys {
  return {
    all: [resourceName] as const,
    lists: () => [resourceName, "list"] as const,
    list: <P extends Record<string, unknown>>(params?: P) =>
      [resourceName, "list", params] as const,
    details: () => [resourceName, "detail"] as const,
    detail: (id: number) => [resourceName, "detail", id] as const,
  };
}

function buildQueryParams<T extends BasePaginationQuery>(
  params: T,
  defaultPageSize: number,
): Record<string, string> {
  const query: Record<string, string> = {
    page: String(params.page || 1),
    pageSize: String(params.pageSize || defaultPageSize),
  };

  for (const [key, value] of Object.entries(params)) {
    if (
      key !== "page" &&
      key !== "pageSize" &&
      value !== undefined &&
      value !== null
    ) {
      query[key] = String(value);
    }
  }

  return query;
}

export function createResource<
  TList,
  TDetail,
  TCreateInput,
  TUpdateInput,
  TQuery extends BasePaginationQuery = BasePaginationQuery,
>(
  config: ResourceConfig<TQuery> & {
    getClient: () => {
      $get: (args: { query: Record<string, string> }) => Promise<unknown>;
      $post: (args: { json: unknown }) => Promise<unknown>;
      ":id": {
        $get: (args: { param: { id: string } }) => Promise<unknown>;
        $put: (args: {
          param: { id: string };
          json: unknown;
        }) => Promise<unknown>;
        $delete: (args: { param: { id: string } }) => Promise<unknown>;
      };
    };
  },
) {
  const {
    resourceName,
    getClient,
    defaultPageSize = 20,
    messages = {},
  } = config;

  const {
    list: listMsg = `获取${resourceName}列表失败`,
    detail: detailMsg = `获取${resourceName}详情失败`,
    create: createMsg = `创建${resourceName}失败`,
    update: updateMsg = `更新${resourceName}失败`,
    delete: deleteMsg = `删除${resourceName}失败`,
  } = messages;

  const keys = createQueryKeys(resourceName);

  function useList(params: TQuery = {} as TQuery) {
    return useQuery<TList, Error>({
      queryKey: keys.list(params as Record<string, unknown>),
      queryFn: async () => {
        const client = getClient();
        const query = buildQueryParams(params, defaultPageSize);
        const response = await client.$get({ query });
        return unwrapApiData<TList>(response, listMsg);
      },
    });
  }

  function useDetail(id: number) {
    return useQuery<TDetail, Error>({
      queryKey: keys.detail(id),
      queryFn: async () => {
        const client = getClient();
        const response = await client[":id"].$get({
          param: { id: String(id) },
        });
        return unwrapApiData<TDetail>(response, detailMsg);
      },
      enabled: id > 0,
    });
  }

  function useCreate() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (input: TCreateInput) => {
        const client = getClient();
        const response = await client.$post({ json: input });
        return unwrapApiData<TDetail>(response, createMsg);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: keys.all });
      },
    });
  }

  function useUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({
        id,
        input,
      }: {
        id: number;
        input: TUpdateInput;
      }) => {
        const client = getClient();
        const response = await client[":id"].$put({
          param: { id: String(id) },
          json: input,
        });
        return unwrapApiData<TDetail>(response, updateMsg);
      },
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: keys.all });
        queryClient.invalidateQueries({ queryKey: keys.detail(id) });
      },
    });
  }

  function useDelete() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (id: number) => {
        const client = getClient();
        const response = await client[":id"].$delete({
          param: { id: String(id) },
        });
        return unwrapApiData<null>(response, deleteMsg);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: keys.all });
      },
    });
  }

  return { keys, useList, useDetail, useCreate, useUpdate, useDelete };
}

export function createReadonlyResource<
  TList,
  TQuery extends BasePaginationQuery = BasePaginationQuery,
>(
  config: ResourceConfig<TQuery> & {
    getClient: () => {
      $get: (args: { query: Record<string, string> }) => Promise<unknown>;
      ":id": {
        $delete: (args: { param: { id: string } }) => Promise<unknown>;
      };
    };
  },
) {
  const {
    resourceName,
    getClient,
    defaultPageSize = 20,
    messages = {},
  } = config;

  const {
    list: listMsg = `获取${resourceName}列表失败`,
    delete: deleteMsg = `删除${resourceName}失败`,
  } = messages;

  const keys = createQueryKeys(resourceName);

  function useList(params: TQuery = {} as TQuery) {
    return useQuery<TList, Error>({
      queryKey: keys.list(params as Record<string, unknown>),
      queryFn: async () => {
        const client = getClient();
        const query = buildQueryParams(params, defaultPageSize);
        const response = await client.$get({ query });
        return unwrapApiData<TList>(response, listMsg);
      },
    });
  }

  function useDelete() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (id: number) => {
        const client = getClient();
        const response = await client[":id"].$delete({
          param: { id: String(id) },
        });
        return unwrapApiData<null>(response, deleteMsg);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: keys.all });
      },
    });
  }

  return { keys, useList, useDelete };
}
