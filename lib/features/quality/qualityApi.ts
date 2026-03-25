import { baseApi } from '@/lib/store/baseApi';
import { endpoints } from '@/lib/api/endpoints';
import type {
  DVR, DVRListParams, CreateDVRRequest, LinkPORequest, LinkPOResponse,
  QualityInspection, CreateInspectionRequest, SubmitInspectionResultRequest,
} from '@/lib/api/types/quality';
import type { PaginatedResponse } from '@/lib/api/types/common';

export const qualityApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getDVRs: builder.query<PaginatedResponse<DVR>, DVRListParams>({
      query: (params) => ({ url: endpoints.dvr.list, params }),
      providesTags: ['DVR'],
    }),
    getDVR: builder.query<DVR, string>({
      query: (id) => ({ url: endpoints.dvr.detail(id) }),
      providesTags: ['DVR'],
    }),
    createDVR: builder.mutation<DVR, CreateDVRRequest>({
      query: (body) => ({ url: endpoints.dvr.list, method: 'POST', data: body }),
      invalidatesTags: ['DVR'],
    }),
    linkPO: builder.mutation<LinkPOResponse, { dvrId: string; data: LinkPORequest }>({
      query: ({ dvrId, data }) => ({ url: endpoints.dvr.linkPo(dvrId), method: 'PATCH', data }),
      invalidatesTags: ['DVR'],
    }),
    getInspection: builder.query<QualityInspection, string>({
      query: (id) => ({ url: endpoints.inspection.detail(id) }),
      providesTags: ['Inspection'],
    }),
    createInspection: builder.mutation<QualityInspection, CreateInspectionRequest>({
      query: (body) => ({ url: endpoints.inspection.create, method: 'POST', data: body }),
      invalidatesTags: ['Inspection', 'DVR'],
    }),
    submitInspectionResult: builder.mutation<void, { id: string; data: SubmitInspectionResultRequest }>({
      query: ({ id, data }) => ({ url: endpoints.inspection.submitResult(id), method: 'PATCH', data }),
      invalidatesTags: ['Inspection', 'DVR'],
    }),
  }),
});

export const {
  useGetDVRsQuery,
  useGetDVRQuery,
  useCreateDVRMutation,
  useLinkPOMutation,
  useGetInspectionQuery,
  useCreateInspectionMutation,
  useSubmitInspectionResultMutation,
} = qualityApi;
